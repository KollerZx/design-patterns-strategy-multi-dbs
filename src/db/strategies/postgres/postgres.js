const ICrud = require('./../interfaces/interfaceCrud')
const Sequelize = require('sequelize')

class Postgres extends ICrud {
    constructor(connection, schema){
        super()
        this._connection = connection
        this._schema = schema   
    }

    async isConnected(){
        try {
            await this._connection.authenticate()
            return true
        } catch (error) {
            console.log('fail', error)
            return false;
        }
    }

    static async defineModel(connection, schema){
        const model = connection.define(
            schema.name, schema.schema, schema.options
        )
        await model.sync()

        return model
    }

    static async connect(){
        const connection = new Sequelize(
            'clientes', //database
            'henrique', 
            'minhasenha',
        
            {
                host: 'localhost',
                dialect:'postgres', //tipo do driver
                quoteIdentifiers: false,
                operatorsAliases: 0,
                logging:false
            }
        )
        return connection
        
    }

    async create(item){

        /* Por padrão quando é criado um objeto no Postgres,
        retorna varias informações, sobre o que foi inserido, manipulado,
        alterado, em qual tabela, coluna, schema, etc
        Para nosso caso, só desejamos que nos retorne os dados inseridos */
        const {dataValues} =  await this._schema.create(item)

        return dataValues
    }

    async read(item = {}){
        return this._schema.findAll({where : item, raw:true})
    }

    async update(id, item){
        return this._schema.update(item, { where: { id:id }})
    }

    async delete(id){
        return this._schema.destroy({where: { id }})
    }
}
module.exports = Postgres;