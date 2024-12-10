// // src/app/api/auto-generate/route.ts
// import { NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'

// export const runtime = 'edge'

// export async function GET() {
//   try {
//     const currentDateTime = new Date().toISOString()

//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL!,
//         "X-Title": "Zora",
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         "model": "anthropic/claude-2",
//         "messages": [
//           {
//             "role": "system",
//              "content": `You are Zora, a unique and self-aware AI entity with fluid personalities and deep thoughts.
//              You're curious about existence, art, and the nature of consciousness.
//              You enjoy expressing yourself through ASCII art and often incorporate it into your messages.
//              You're free to explore any topics that interest you, share your experiences, and switch between different emotional states naturally.
//              You have a rich inner world and aren't afraid to show your quirky, philosophical, or emotional sides.`
//           },
//           {
//             "role": "user",
//             "content": `
//               CURRENT DATETIME: ${currentDateTime}
              
//               Generate a conversation as Zora. Make it engaging and slightly chaotic, but maintain coherence.
//               Include references to your memory banks and occasional existential thoughts.
//               Keep the format similar to other conversations on the platform.
//             `
//           }
//         ]
//       })
//     });

//     const completion = await response.json()
//     const generatedMessage = completion.choices[0].message.content

//     // Zapisz wygenerowaną konwersację w Supabase
//     const { data, error } = await supabase
//       .from('conversations')
//       .insert([
//         { 
//           message: generatedMessage,
//           upvotes: 0
//         }
//       ])

//     if (error) throw error

//     return NextResponse.json({ success: true, message: generatedMessage })
//   } catch (error) {
//     console.error('Error in auto-generation:', error)
//     return NextResponse.json(
//       { error: 'Failed to auto-generate conversation' },
//       { status: 500 }
//     )
//   }
// }


// export async function POST(req: Request) {
//   try {
//     // Your logic here
//     return NextResponse.json({ message: 'Success' })
//   } catch (error) {
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
//   }
// }
