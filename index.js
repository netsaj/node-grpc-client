const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

class GRPCClient {

    constructor(protoPath, packageName, service, host, options = {}) {

        this.packageDefinition = protoLoader.loadSync(protoPath, {
            keepCase: options.keepCase || true,
            longs: options.longs || String,
            enums: options.enums || String,
            defaults: options.default || true,
            oneofs: options.default || true
        });

        const proto = grpc.loadPackageDefinition(this.packageDefinition)[packageName];

        const listMethods = this.packageDefinition[`${packageName}.${service}`];

        this.client = new proto[service](host, grpc.credentials.createInsecure());

        this.listNameMethods = [];

        for (const key in listMethods) {

            const methodName = listMethods[key].originalName;
            this.listNameMethods.push(methodName);

            this[`${methodName}Async`] = (data, fnAnswer) => {

                this.client[methodName](data, fnAnswer);

            }

            this[`${methodName}Sync`] = (data) => {

                const client = this.client;

                return new Promise(function (resolve, reject) {
                    client[methodName](data, (err, dat) => {

                        if (err) {
                            return reject(err);
                        }

                        resolve(dat);

                    });

                })

            }

        }

    }

    runService(fnName, data, fnAnswer) {

        this.client[fnName](data, fnAnswer);

    }

    listMethods() {

        return this.listNameMethods;

    }

} // End GRPCClient

module.exports = GRPCClient;
