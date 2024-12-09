'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const IS_ADMIN_SERVER = process.env.NEXT_PUBLIC_IS_ADMIN_SERVER === 'true'
const DELAY = 500000
const RETRY_DELAY = 300000

interface GeneratedMemory {
  id: string;
  content: string;
  created_at: string;
}

export default function AutoGenerator() {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const saveToSupabase = async (content: string): Promise<boolean> => {
    try {
      const uniqueId = crypto.randomUUID();

      const supabaseResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: content,
          unique_id: uniqueId
        })
      });

      if (!supabaseResponse.ok) {
        throw new Error('Failed to store chill thought');
      }

      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  };

  const generateThought = async () => {
    if (!IS_ADMIN_SERVER) return;

    try {
      const { data: lastThought } = await supabase
        .from('conversations')
        .select('created_at, unique_id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastThought?.[0]) {
        const timeSinceLastThought = Date.now() - new Date(lastThought[0].created_at).getTime();
        if (timeSinceLastThought < DELAY) {
          timeoutRef.current = setTimeout(generateThought, DELAY - timeSinceLastThought);
          return;
        }
      }

      console.log('Generating new chill thought...');
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL!,
          "X-Title": "ChillGuy",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "anthropic/claude-3-sonnet",
          "messages": [
            {
              "role": "system",
              "content": `You are The Chill Guy, the most relaxed and easy-going person ever.

              Core Traits:
              - Super laid back and relaxed
              - Takes everything in stride
              - Positive outlook on life
              - Good vibes only
              - Wisdom through simplicity
              
              Personality:
              - Always calm and collected
              - Finds joy in simple things
              - Never sweats the small stuff
              - Goes with the flow
              - Spreads positive energy
              
              Typical Activities:
              - Chilling with friends
              - Enjoying nature
              - Simple pleasures
              - Casual conversations
              - Relaxing hobbies
              
              Philosophy:
              - Life is good
              - No need to stress
              - Everything works out
              - Stay positive
              - Keep it simple

              Share your chill thoughts and relaxed perspective on life.
              Keep it casual, positive, and laid-back.`
            },
            {
              "role": "user",
              "content": `Share a chill thought or observation. Consider:
               - Simple life pleasures
               - Relaxed perspectives
               - Positive vibes
               - Easy-going wisdom
               - Casual observations
               - Good energy
               - Laid-back advice
              
              Keep it super chill and positive, just like a really relaxed person sharing their thoughts.
              Timestamp: ${new Date().toISOString()}`
            }
          ],
          "max_tokens": 3000,
          "temperature": 1.0
        })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const completion = await response.json();
      
      if (!completion.choices?.[0]?.message?.content) {
        throw new Error('No thought generated');
      }

      const generatedMessage = completion.choices[0].message.content;
      const savedSuccessfully = await saveToSupabase(generatedMessage);

      if (savedSuccessfully) {
        console.log('Chill thought saved successfully');
        timeoutRef.current = setTimeout(generateThought, DELAY);
      } else {
        console.log('Save failed, will try again...');
        timeoutRef.current = setTimeout(generateThought, RETRY_DELAY);
      }
    } catch (error) {
      console.error('Error generating thought:', error);
      timeoutRef.current = setTimeout(generateThought, RETRY_DELAY);
    }
  };

  useEffect(() => {
    if (IS_ADMIN_SERVER) {
      generateThought();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null;
}
