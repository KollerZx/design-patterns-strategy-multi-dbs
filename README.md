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

## Estratégia com Postgres ##

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
**Método create**

Por padrão quando é criado um objeto no Postgres,
retorna varias informações, sobre o que foi inserido, manipulado,
alterado, em qual tabela, coluna, schema, etc
Para nosso caso, só desejamos que nos retorne os dados inseridos

```javascript
    async create(item){

        const {dataValues} =  await this._clientes.create(item)

        return dataValues
    }
```

## TDD (Test Driven Development) ##

Aplicando a prática do desenvolvimento orientado por testes, vamos criar um teste para nossa estratégia com o Postgres

Para isso instalaremos o mocha como dependência de desenvolvimento: 

`npm install --save-dev mocha`

Dentro do package.json alteramos o script test para:
```json
    "test": "mocha src/__tests__/*.js"
```

- Criando nossos primeiros testes

Como o método isConnected, retorna true ou false, criamos nosso teste baseado nesse resultado

```javascript
    const assert = require('assert')
    const Postgres = require('./../db/strategies/postgres')
    const Context = require('./../db/strategies/base/contextStrategy')

    const context = new Context(new Postgres())

    const MOCK_CLIENTE_CADASTRAR = {
        nome: "João",
        profissao: "Pintor"
    }
    describe('Postgres Strategy', function() {
        /* 
            Como estamos trabalhando com banco de dados,
            pode ser que a conexão demore um pouco, para isso
            definimos o timeout
        
        */
        this.timeout(Infinity)

        this.beforeAll(async function(){
            await context.connect()
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
            console.log('result',result)
            assert.deepStrictEqual(result, MOCK_CLIENTE_CADASTRAR)
        })
    })
```

rodando o teste:
    
`npm test`


**Método Read**

O método findAll do sequelize retorna um array com uma lista de resultados e todos atributos e informações, desejamos apenas que retorne os dados referente a nosso objeto consultado, pra isso passamos o atributo 'raw:true'

```javascript
    async read(item = {}){
        return this._clientes.findAll({where : item, raw:true})
    }
```

- Seguindo nosso fluxo TDD, ja implementamos o teste para nosso método criado

Como ja mencionado, o método findAll nos retorna um array, desejamos apenas a primeira posição desse array utilizando [result], e também desprezamos a chave id para nosso teste

```javascript
    it('listar', async function (){
        const [result] = await context.read({nome: MOCK_CLIENTE_CADASTRAR.nome})

        delete result.id
        assert.deepStrictEqual(result, MOCK_CLIENTE_CADASTRAR)
    })
```

**Método Update**

O método update, deve receber o id do objeto a ser atualizado, e o valor a ser atualizado

```javascript
    async update(id, item){
        return this._clientes.update(item, { where: { id:id }})
    }
```

Para que nosso teste do update funcione, vamos inserir o objeto MOCK_CLIENTE_ATUALIZAR que devemos defini-lo antes dos testes:

```javascript
    const MOCK_CLIENTE_ATUALIZAR = {
        nome: "Pedro",
        profissao: "Professor"
    }
```


```javascript
    this.beforeAll(async function(){
        await context.connect()
        await context.create(MOCK_CLIENTE_ATUALIZAR)
    })

```
O retorno da função update é um array com um ou dois elementos. O primeiro elemento é sempre o número de linhas afetadas, enquanto o segundo elemento são as linhas afetadas reais (suportado apenas em postgres com options.returning: true)

fonte: `https://sequelize.org/master/class/lib/model.js~Model.html#static-method-update`

```javascript
    it('atualizar', async function (){
        const [itemAtualizar] = await context.read({ nome: MOCK_CLIENTE_ATUALIZAR.nome})

        
        const novoItem = {
            ...MOCK_CLIENTE_ATUALIZAR, 
            nome:'Luiz'
        }
        const [result] = await context.update(itemAtualizar.id, novoItem)

        assert.deepStrictEqual(result, 1)
    })
```

**Método delete**

```javascript

    async delete(id){
        return this._clientes.destroy({where: { id }})
    }
```

Assim como o método update, o delete retorna o numero de linhas afetadas, com base nisso criamos nosso teste.


```javascript
    it('remover por id', async function (){
        const [item] = await context.read({})

        const result = await context.delete(item.id)

        assert.deepStrictEqual(result, 1)
    })
```

## Estratégia com MongoDB ##

**Instalando o Mongoose**

`npm install mongoose`

**Criando a conexão com o Database**

Dentro da estratégia do MongoDb, definimos o modelo dos dados do banco e implementamos o método de conexão

```javascript

const ICrud = require('./interfaces/interfaceCrud')
const Mongoose = require('mongoose');
class MongoDB extends ICrud {
    constructor() {
        super()
    }
    defineModel() {
        /* Cria o modelo de validação de como a coleção será  */
        const clienteSchema = new Mongoose.Schema({
            nome: {
                type: String,
                required: true
            },
            profissao: {
                type: String,
                required: true
            },
            insertedAt: {
                type: Date,
                default: new Date()
            }
        })
        /* Registra o modelo na tabela clientes com o Schema definido*/

        this._clientes = Mongoose.model('clientes', clienteSchema)
    }
     connect() {
        Mongoose.connect('mongodb://henrique:minhasenha@localhost:27017/clientes', { useNewUrlParser: true, useUnifiedTopology: true }, function (error) {
            if (!error) return;

            console.log('Failed to connect!', error);
        });

        const connection = Mongoose.connection
        this._driver = connection
        connection.once('open', () => console.log('Database is running!'))

        /* Após realizar a conexão ja define o modelo */
        this.defineModel()
        
    }
}
```

Criamos o método isConnected para verificar o status da conexão, antes da definição da classe criamos um objeto STATUS para armazenar os status padrão do Mongoose

```javascript
    const STATUS = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
}
```

```javascript
    async isConnected() {
    
        const state = STATUS[this._driver.readyState]

        if(state === 'Connected') return state;

        if(state !== 'Connecting') return state;

        await new Promise(resolve => setTimeout(resolve,1000))

        return STATUS[this._driver.readyState]
    }
```

Dessa forma, se o status for conectando, lançamos uma promise e aguardamos 1 segundo para que o status seja retornado novamente. Vamos validar isso em nossos testes.

```javascript
const assert = require('assert')
const MongoDB = require('./../db/strategies/mongodb')
const Context = require('./../db/strategies/base/contextStrategy')

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
})

```

**Método Create**

```javascript

    create(item) {
        return this._clientes.create(item)
    }

```

Criamos o objeto MOCK_CLIENTE_CADASTRAR para testar nosso método create.

```javascript
    const MOCK_CLIENTE_CADASTRAR = {
        nome:'Jose',
        profissao: 'Mecânico'
    }
```
Para validar nosso teste, extraimos do objeto retornado apenas os valores 'nome' e 'profissão', e comparamos com o objeto MOCK_CLIENTE_CADASTRAR

```javascript

    it('cadastrar', async function (){
        const { nome, profissao } = await context.create(MOCK_CLIENTE_CADASTRAR)

        assert.deepStrictEqual({nome, profissao}, MOCK_CLIENTE_CADASTRAR)
    })
```



