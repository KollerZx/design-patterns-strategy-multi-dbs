const assert = require('assert')
const MongoDB = require('./../db/strategies/mongodb/mongodb')
const Context = require('./../db/strategies/base/contextStrategy')
const ClienteSchema = require('./../db/strategies/mongodb/schemas/clientesSchema')
const MOCK_CLIENTE_CADASTRAR = {
    nome:'Jose',
    profissao: 'Mecânico'
}
const MOCK_CLIENTE_ATUALIZAR = {
    nome:'Alfredo',
    profissao: 'Motorista'
}
let MOCK_CLIENTE_ID = ''
let context = {}

describe('MongoDB suite de testes', function (){

    this.beforeAll(async () => {
        const connection = MongoDB.connect()

        context = new Context(new MongoDB(connection, ClienteSchema))

        const result = await context.create(MOCK_CLIENTE_ATUALIZAR)
        MOCK_CLIENTE_ID = result._id 
    })
    it('Verificar conexão', async function (){
        const result = await context.isConnected()

        const expected = 'Connected'

        assert.deepStrictEqual(result, expected)
    })
    it('cadastrar', async function (){
        const { nome, profissao } = await context.create(MOCK_CLIENTE_CADASTRAR)

        assert.deepStrictEqual({nome, profissao}, MOCK_CLIENTE_CADASTRAR)


    })
    it('listar', async function (){
        /* Pega somente os atributos nome e poder do objeto retornado na primeira posição da lista */
        /* const result = await context.read({nome: MOCK_CLIENTE_CADASTRAR.nome},4)
        console.log('result', result) */
        const [{nome, profissao}] = await context.read({nome: MOCK_CLIENTE_CADASTRAR.nome})

        const result = {
            nome, profissao
        }

        assert.deepStrictEqual(result, MOCK_CLIENTE_CADASTRAR)
    })
    it('atualizar', async function (){
        const result = await context.update(MOCK_CLIENTE_ID, {nome: 'Vicente'})

        assert.deepStrictEqual(result.nModified, 1)
    })
    it('remover', async function (){
        const result = await context.delete(MOCK_CLIENTE_ID)

        assert.deepStrictEqual(result.n, 1)
    })
})