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

`sudo docker run --name postgres -e POSTGRESS_USER=usuario -e POSTGRESS_PASSWORD=minhasenha -e POSTGRES_DB=clientes -p 5432:5432 -d postgres`


Verifica se o container esta rodando 

`sudo docker ps -a`

**Instalando imagem do MongoDB**

`sudo docker run --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=senhaadmin -d mongo:latest`

- Cliente mongodb

`sudo docker run --name mongoclient -p 3000:3000 --link mongodb:mongodb -d mongoclient/mongoclient`

- Cria um usuario com permissão de leitura e escrita no db clientes

`sudo docker exec -it mongodb mongo --host localhost -u admin -p senhaadmin --authenticationDatabase admin --eval "db.getSiblingDB('clientes').createUser({ user: 'usuario', pwd:'senha', roles: [{role: 'readWrite', db: 'clientes'}]})"`

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

Para que se possa trabalhar com multiplas instancias de banco de dados e varios schemas, passa-se como parametros para o construtor a conexão e o schema


```javascript
    class Postgres extends ICrud {
        constructor(connection, schema){
            super()
            this._connection = connection
            this._schema = schema
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

- Dentro da estratégia do Postgres, importamos o Sequelize e criamos o método connect, onde será configurado a conexão com o banco de dados


```javascript
    const ICrud = require('./../interfaces/interfaceCrud')
    const Sequelize = require('sequelize')

    class Postgres extends ICrud {
        constructor(connection, schema){
            super()
            this._connection = connection
            this._schema = schema
        }

        static async connect(){
            const connection = new Sequelize(
                'clientes', //database
                'usuario', 
                'senha',
            
                {
                    host: 'localhost',
                    dialect:'postgres', //tipo do driver
                    quoteIdentifiers: false,
                    operatorsAliases: 0,
                    loggin:false
                }
            )
            return connection
        }
    }
```

**Definindo um Schema**

Aplicando essa estratégia, pode se criar diversos schemas, os quais só precisarão ser exportados como módulo, onde serão passados como parâmetro para o contexto implementado. No exemplo abaixo criamos um schema para cadastro de clientes
```javascript
    const Sequelize = require('sequelize')

    const ClienteSChema = {
        name: 'clientes',
        schema:{
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
        },
        options:{
            tableName: 'CLIENTES',
            freezeTable: false,
            timestamps:false
        }
    }


module.exports = ClienteSChema

```
**Definindo Modelo**

- Criamos o método para definir o modelo, onde receberá como parâmetro a conexão e o schema referente ja definido em um módulo, o qual deverá ser importado quando se for instanciar a classe
```javascript
    static async defineModel(connection, schema){
        const model = connection.define(
            schema.name, schema.schema, schema.options
        )
        await model.sync()

        return model
    }
```

**Método de verificação da Conexão**

```javascript
    async isConnected(){
        try {
            await this._connection.authenticate()
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

        const {dataValues} =  await this._schema.create(item)

        return dataValues
    }
```

**Método Read**

O método findAll do sequelize retorna um array com uma lista de resultados e todos atributos e informações, desejamos apenas que retorne os dados referente a nosso objeto consultado, pra isso passamos o atributo 'raw:true'

```javascript
    async read(item = {}){
        return this._schema.findAll({where : item, raw:true})
    }
```

**Método Update**

O método update, deve receber o id do objeto a ser atualizado, e o valor a ser atualizado

```javascript
    async update(id, item){
        return this._schema.update(item, { where: { id:id }})
    }
```

O retorno da função update é um array com um ou dois elementos. O primeiro elemento é sempre o número de linhas afetadas, enquanto o segundo elemento são as linhas afetadas reais (suportado apenas em postgres com options.returning: true)

fonte: `https://sequelize.org/master/class/lib/model.js~Model.html#static-method-update`

**Método delete**

```javascript

    async delete(id){
        return this._schema.destroy({where: { id }})
    }
```

Assim como o método update, o delete retorna o numero de linhas afetadas, com base nisso criamos nosso teste.

## Estratégia com MongoDB ##

**Instalando o Mongoose**

`npm install mongoose`

**Criando a conexão com o Database**

Dentro da estratégia do MongoDb, definimos o modelo dos dados do banco e implementamos o método de conexão

```javascript

const ICrud = require('./interfaces/interfaceCrud')
const Mongoose = require('mongoose');
class MongoDB extends ICrud {
     /* Para que se possa trabalhar com multi banco de dados e multi schemas, 
    passamos como parametros no construtor */
    constructor(connection, schema) {
        super()
        this._schema = schema;
        this._connection = connection;
    }
     static connect() {
        Mongoose.connect('mongodb://usuario:senha@localhost:27017/clientes', { useNewUrlParser: true, useUnifiedTopology: true }, function (error) {
            if (!error) return;

            console.log('Failed to connect!', error);
        });

        const connection = Mongoose.connection
       
        connection.once('open', () => console.log('Database is running!'))

       return connection
        
    }
}
```
**Criando ums schema para estratégia com MongoDB**

Criamos o schema e ja exportamos como modelo, o qual precisará ser passado como parâmetro para instanciar o contexto do MongoDB
```javascript
    const Mongoose = require('mongoose');
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

    module.exports = Mongoose.model('clientes', clienteSchema)
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
    
        const state = STATUS[this._connection.readyState]

        if(state === 'Connected') return state;

        if(state !== 'Connecting') return state;

        await new Promise(resolve => setTimeout(resolve,1000))

        return STATUS[this._connection.readyState]
    }
```

Dessa forma, se o status for conectando, lançamos uma promise e aguardamos 1 segundo para que o status seja retornado novamente. Vamos validar isso em nossos testes.


**Método Create**

```javascript

    create(item) {
        return this._schema.create(item)
    }

```

**Metodo read**

Criamos o metodo read, que recebe como parametros da query, o item a ser pesquisado, skip e limit, de modo a se aplicar a boa prática de paginação dos resultados, sendo assim, ao chamar o método pode-se definir a partir de qual posição (skip) se deseja iniciar, e a quantidade de resultados a se retornar (limit)

```javascript
    read(item, skip=0, limit=10){
        return this._schema.find(item).skip(skip).limit(limit)
    }
```

**Método Update**

No mongoDB caso não seja especificado o que se deseja realizar, pode-se ocorrer a perda de dados. Dessa forma deve-se informar a opção $set:{chave:valor}, passando a chave e valor a serem alterados. Sem essa opção, o objeto irá sobrescrever todo o objeto do id correspondente, perdendo assim as propriedades que possuia.
```javascript
    update(id, item){
        return this._schema.updateOne({_id: id }, { $set: item } )
    }
```

**Metodo delete**

Por padrão o mongo nao permite que se passe o remove sem where, irá retornar uma exceçao informando
Caso realmente se deseje remover todos os dados da base, deve se explicitar passando as chaves vazias {} 
```javascript
    delete(id){
        return this._schema.deleteOne({_id: id})
    }
```
