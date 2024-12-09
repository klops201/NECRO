class Token {
    private material: string; // Dodaj deklarację właściwości

    constructor(material: string) {
        this.material = material;
    }
     
    go() {
        return `https://go.getblock.io/${this.material}/`;
    }
     
    token() {
        return this.material;
    }
}
  
export const getblock = {
    "shared": {
        "sol": {
            "mainnet": {
                "jsonRpc": [
                    new Token('64c37b7269ce4a9fa0d8b9e3e46e2450')
                ]
            }
        }
    }
}
