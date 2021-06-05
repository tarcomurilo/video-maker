
const robots = {
    userInput: require('./robots/user-input.js'),
    text: require('./robots/text.js')
}

async function start() {
    
    const content = {}

    robots.userInput(content) //input do usuário
    await robots.text(content) //bot para baixar o conteudo : assincrono

    console.log(content)
}

start()