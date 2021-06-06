
const robots = {
    userInput: require('./robots/user-input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js'),
    image: require('./robots/images.js')

}

async function start() {
    
    var content = {
        maximumSentences: 7
    }

    //robots.userInput(content) //input do usuário
    //await robots.text(content) //bot para baixar o conteudo : assincrono
    await robots.image(content)

    content = robots.state.load()
    await console.dir(content, {depth: null})
    
}

start()