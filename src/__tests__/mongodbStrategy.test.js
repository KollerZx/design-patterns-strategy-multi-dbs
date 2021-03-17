const assert = require('assert')
const MongoDB = require('./../db/strategies/mongodb')
const Context = require('./../db/strategies/base/contextStrategy')

const MOCK_CLIENTE_CADASTRAR = {
    nome:'Jose',
    profissao: 'Mecânico'
}
const context = new Context(new MongoDB())

describe('MongoDB suite de testes', function (){

    this.beforeAll(async () => {
        await context.connect()
    })
    it('Verificar conexão', async function (){
        const result = await context.isConnected()

        console.log('result', result)

        const expected = 'Connected'

        assert.deepStrictEqual(result, expected)
    })
    it('cadastrar', async function (){
        const { nome, profissao } = await context.create(MOCK_CLIENTE_CADASTRAR)

        assert.deepStrictEqual({nome, profissao}, MOCK_CLIENTE_CADASTRAR)


    })
})