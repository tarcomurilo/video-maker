const algorithmia = require('algorithmia')
const credentials = require('../credentials/credentials.json').apiKey // está a chave da api
const ibmCredentials = require('../credentials/credentials.json').ibmCredentials
const sbd = require('sbd')
const state = require('./state.js')

// inicio da api do watson da ibm 
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1')
const { IamAuthenticator } = require('ibm-watson/auth')

const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: ibmCredentials }),
  version: '2018-04-05',
  serviceUrl: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/75bd2d12-54aa-41a2-a28c-3eb3334fdbe4'
})
//fim da api

async function robot(content) { // inicializa o robt
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }
    
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

    async function fetchKeywordsOfAllSentences(content){
        for (const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }

    }

    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise( (resolve, reject) => {
            nlu.analyze({ //analisa o texto pelo watson
                text: sentence,
                features: {
                    keywords: {}
                    }
                })
                .then(response => { 
                    const keywords = response.result.keywords.map(keyword => {
                        return keyword.text
                    })
                    //const keywords = response.keywords.map( keyword  => {
                    //    return keyword.text
                    //})
                    resolve(keywords)
                })
                .catch(err => {
                    console.log('Erro: ', err)
                   
                })
                   
                
        })
            

    }

}
   
module.exports = robot