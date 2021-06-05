const algorithmia = require('algorithmia')
const credentials = require('../credentials/credentials.json').apiKey // está a chave da api
const sbd = require('sbd')

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    
    //função para baixar o texto do wikipedia 
    async function fetchContentFromWikipedia(content) {

        const algorithmiaAuthenticated = algorithmia.client(credentials) //retorna a credencial
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300") //retorna o algoritimo
        const wikipediaResponde = await wikipediaAlgorithm.pipe({"articleName": content.searchTerm, "lang" : 'PT'}) //envia para o algoritmo e recebe
        const wikipediaContent = wikipediaResponde.get() //leitura do conteudo recebido
        
        content.sourceContentOriginal = wikipediaContent.content

    }
    
   // lixo

 //limpar o conteúdo da wikipedia
    function sanitizeContent(content){
        const textSanitized = removeBlankMarkParenthesisData(content.sourceContentOriginal)

        function removeBlankMarkParenthesisData(text){ //remove as linhas brancas
            const allLines = text.split('\n')
            const noBlankMarkdownLines = allLines.filter((line) => {
            if (line.trim().length === 0 || line.trim().startsWith('=')){ //filtra markdowns e linhas em branco
                return false
            }

            return true
            })
        
            const textSanitizedWithDate = noBlankMarkdownLines.join(' ')
            const textSanitized = textSanitizedWithDate.replace( /\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ') //remover os parenteses e espaços estranhos
            return textSanitized
        }

        content.sourceContentSanitized = textSanitized
        console.log("Conteúdo sanitizado")
    }
    
function breakContentIntoSentences(content){
    content.sentences = []
    const sentences = sbd.sentences(content.sourceContentSanitized)

    sentences.forEach((sentence) => {
        content.sentences.push({
            text: sentence,
            keywords: [],
            images: []
        })
    })
}

}
   

module.exports = robot