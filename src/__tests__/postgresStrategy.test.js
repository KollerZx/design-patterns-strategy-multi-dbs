const assert = require('assert')
const Postgres = require('./../db/strategies/postgres')
const Context = require('./../db/strategies/base/contextStrategy')

const context = new Context(new Postgres())

describe('Postgres Strategy', function() {
    /* 
        Como estamos trabalhando com banco de dados,
        pode ser que a conexão demore um pouco, para isso
        definimos o timeout
    
    */
    this.timeout(Infinity) 

    it('PostgresSQL Connection',  async function () {
        const result = await context.isConnected()

        assert.deepStrictEqual(result, true)
    })
})