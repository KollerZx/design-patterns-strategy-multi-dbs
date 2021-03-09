
/* Classe customizada de erro para quando um método não for implementado */
class NotImplementedException extends Error {
    constructor(){
        super("Not Implemented Exception");
    }
}

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
class Postgres extends ICrud {
    constructor(){
        super()
    }

    create(item){
        console.log('O item foi salvo em postgres')
    }
}

class MongoDB extends ICrud {
    constructor(){
        super()
    }
    create(item){
        console.log('O item foi salvo em MongoDB')
    }
}

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

