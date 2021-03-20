const assert = require('assert')
const Postgres = require('./../db/strategies/postgres/postgres')
const Context = require('./../db/strategies/base/contextStrategy')
const ClienteSchema = require('./../db/strategies/postgres/schemas/clienteSchema')


const MOCK_CLIENTE_CADASTRAR = {
    nome: "João",
    profissao: "Pintor"
}

const MOCK_CLIENTE_ATUALIZAR = {
    nome: "Pedro",
    profissao: "Professor"
}

let context = {}
describe.only('Postgres Strategy', function() {
    /* 
        Como estamos trabalhando com banco de dados,
        pode ser que a conexão demore um pouco, para isso
        definimos o timeout
    
    */
    this.timeout(Infinity)

    this.beforeAll(async function(){
        const connection = await Postgres.connect()
        const model = await Postgres.defineModel(connection, ClienteSchema)
        context = new Context(new Postgres(connection, model))
        
        await context.create(MOCK_CLIENTE_ATUALIZAR)
    })

    it('PostgresSQL Connection',  async function () {
        const result = await context.isConnected()

        assert.deepStrictEqual(result, true)
    })

    it('cadastrar', async function (){
        const result = await context.create(MOCK_CLIENTE_CADASTRAR)
        
        /* Como o resultado retorna o id junto, e para nosso teste 
        é irrelevante, nós deletamos essa chave*/
        delete result.id
        /* console.log('result',result) */
        assert.deepStrictEqual(result, MOCK_CLIENTE_CADASTRAR)
    })
    it('listar', async function (){
        const [result] = await context.read({nome: MOCK_CLIENTE_CADASTRAR.nome})

        delete result.id
        assert.deepStrictEqual(result, MOCK_CLIENTE_CADASTRAR)
    })
    it('atualizar', async function (){
        const [itemAtualizar] = await context.read({ nome: MOCK_CLIENTE_ATUALIZAR.nome})

        
        const novoItem = {
            ...MOCK_CLIENTE_ATUALIZAR, 
            nome:'Luiz'
        }
        const [result] = await context.update(itemAtualizar.id, novoItem)

        assert.deepStrictEqual(result, 1)
    })

    it('remover por id', async function (){
        const [item] = await context.read({})

        const result = await context.delete(item.id)

        assert.deepStrictEqual(result, 1)
    })
})