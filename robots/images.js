const state = require('./state.js') 
const google = require('googleapis').google
const customSearch = google.customsearch('v1')

const googleSearchKey = require('../credentials/credentials.json').googleKey
const googleSearchId = require('../credentials/credentials.json').googleSEID

async function robot(){
    const content = state.load()
    
    await itarateSearchOverKeywords(content)

    state.save(content)

    async function itarateSearchOverKeywords(content) {
        for (const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImageLinks(query)

            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImageLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchKey,
            cx: googleSearchId,
            q: query,
            num: 2,
            searchType: 'image'
        })
        
        const imagesUrl = response.data.items.map((item) => {
            if (item != false) {
                return item.link }
        })

        return imagesUrl
    }

}

module.exports = robot