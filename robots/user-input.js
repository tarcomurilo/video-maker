const readline = require('readline-sync')
function robot(content) {
    
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    function askAndReturnSearchTerm() {

        return readline.question('Digite um termo da Wikipedia: ')
        
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedprefixIndex = readline.keyInSelect(prefixes)
        const selectedprefixText = prefixes[selectedprefixIndex]
        
        return selectedprefixText
    }

}

module.exports = robot