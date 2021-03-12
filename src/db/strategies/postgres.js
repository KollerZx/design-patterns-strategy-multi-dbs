const ICrud = require('./interfaces/interfaceCrud')
const Sequelize = require('sequelize')

class Postgres extends ICrud {
    constructor(){
        super()
        this._driver = null
        this._clientes = null
    }

    async isConnected(){
        try {
            await this._driver.authenticate()
            return true
        } catch (error) {
            console.log('fail', error)
            return false;
        }
    }

    async defineModel(){
        this._clientes = this._driver.define('clientes', {
            id: {
                type: Sequelize.INTEGER,
                required: true,
                primaryKey: true,
                autoIncrement: true
            },
            nome: {
                    type: Sequelize.STRING,
                    required: true
            },
            profissao:{
                type: Sequelize.STRING,
                required: true
            } 
            
        }, {
            tableName: 'CLIENTES',
            freezeTable: false,
            timestamps:false
        })
        await this._clientes.sync()
    }

    async connect(){
        this._driver = new Sequelize(
            'clientes', //database
            'henrique', 
            'minhasenha',
        
            {
                host: 'localhost',
                dialect:'postgres', //tipo do driver
                quoteIdentifiers: false,
                operatorsAliases: 0
            }
        )
        await this.defineModel()
        
    }

    async create(item){

        /* Por padrão quando é criado um objeto no Postgres,
        retorna varias informações, sobre o que foi inserido, manipulado,
        alterado, em qual tabela, coluna, schema, etc
        Para nosso caso, só desejamos que nos retorne os dados inseridos */
        const {dataValues} =  await this._clientes.create(item)

        return dataValues
    }

    async read(item = {}){
        return this._clientes.findAll({where : item, raw:true})
    }

    async update(id, item){
        return this._clientes.update(item, { where: { id:id }})
    }

}
module.exports = Postgres;