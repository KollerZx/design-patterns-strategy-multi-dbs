## AMBIENTE EM DOCKER ##

- Link para fazer o download do docker
    `https://www.docker.com/get-started`

- Repositório de imagens docker 
    `https://hub.docker.com/`


**Instalando imagem do Postgres**

    1- define o nome do container
    2- define usuario e senha
    3- define um database inicial
    4- informa as portas que o database estará exposto
    5- Roda em segundo plano ' -d '
    6- Nome da imagem a ser baixada

`sudo docker run --name postgres -e POSTGRESS_USER=henrique -e POSTGRESS_PASSWORD=minhasenha -e POSTGRES_DB=clientes -p 5432:5432 -d postgres`


Verifica se o container esta rodando 

`sudo docker ps -a`

**Instalando imagem do MongoDB**

`sudo docker run --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=senhaadmin -d mongo:latest`

- Cliente mongodb

`sudo docker run --name mongoclient -p 3000:3000 --link mongodb:mongodb -d mongoclient/mongoclient`

- Cria um usuario com permissão de leitura e escrita no db clientes

`sudo docker exec -it mongodb mongo --host localhost -u admin -p senhaadmin --authenticationDatabase admin --eval "db.getSiblingDB('clientes').createUser({ user: 'henrique', pwd:'minhasenha', roles: [{role: 'readWrite', db: 'clientes'}]})"`

**Instalando imagem do Adminer**

Adminer é uma imagem de painel administrativo para databases

`sudo docker run --name adminer -p 8080:8080 --link postgres:postgres -d adminer`

## DESIGN PATTERNS: STRATEGY

**Implementa uma classe customizada de erro**

```javascript
    class NotImplementedException extends Error {
        constructor(){
            super("Not Implemented Exception");
        }
    }

```
**Classe para servir como interface**

Caso os métodos não sejam implementados em suas estratégias, irá chamar o método do ICrud onde irá estourar a exceção

```javascript
    class ICrud {
        create(item){
            throw new NotImplementedException()
        }

        read(query){
            throw new NotImplementedException()
        }

        update(id, item){
            throw new NotImplementedException()
        }

        delete(id){
            throw new NotImplementedException()
        }
    }
```

**Implementando o contexto para banco de dados**

```javascript
    class ContextStrategy {
    /* o construtor receberá qual a estratégia de banco de dados */
    constructor(strategy){
        this._database = strategy
    }

    /* As estratégias devem possuir os métodos implementados, 
    caso contrário entrará na excessão*/

    create(item){
        return this._database.create(item)
    }

    read(query){
        return this._database.read(query)
    }
    update(id, item){
        return this._database.update(id, item)
    }

    delete(id){
        return this._database.delete(id)
    }
}

```

**Implementa a estratégia do Postgres**

```javascript
    class Postgres extends ICrud {
    constructor(){
        super()
    }
}
```

Dentro de cada estratégia os métodos devem ser implementados, caso se instancie 
a classe e chame um método não implementado, chamará o método correspondente na classe "mãe" nesse caso, ICrud, o que resultará na exceção


## SEQUELIZE ##

Afim de se simplificar os métodos de manipulação do banco de dados, utilizamos um ORM, no caso o Sequelize.


- Instalando o Sequelize: 
    `npm intall sequelize`

- Instalando os drivers do Postgres: 
    `npm install pg-hstore pg`

**Configurando driver**

- Dentro da estratégia do Postgres, importamos o Sequelize e criamos o método connect, onde será configurado o driver do database

```javascript
    const ICrud = require('./interfaces/interfaceCrud')
    const Sequelize = require('sequelize')

    class Postgres extends ICrud {
        constructor(){
            super()
            this._driver = null
            this._clientes = null
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
    }
```
**Verificando se esta conectado**

```javascript
    async isConnected(){
            try {
                await this._driver.authenticate()
                return true
            } catch (error) {
                console.log('fail', error)
                return false;
            }
        }
```
**Definindo Modelo**

- Criamos o método defineModel() 
```javascript
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
        await Clientes.sync()
    }
```

## TDD (Test Driven Development) ##

Aplicando a prática do desenvolvimento orientado por testes, vamos criar um teste para nossa estratégia com o Postgres

Para isso instalaremos o mocha como dependência de desenvolvimento: 

`npm install --save-dev mocha`

- Criando nossos primeiros testes

Como o método isConnected, retorna true ou false, criamos nosso teste baseado nesse resultado

```javascript
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
```
- Rodando o teste:

`mocha *.test.js`