const ICrud = require('./interfaces/interfaceCrud')
const Sequelize = require('sequelize')

class Postgres extends ICrud {
    constructor(){
        super()
        this._driver = null
        this._clientes = null
        this._connect()
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

    _connect(){
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
        
    }

    create(item){
        console.log('O item foi salvo em postgres')
    }

}
module.exports = Postgres;