var assert = require("assert");
var i18n = require('i18next');

var supertest = require('supertest');
var app = require('../app');

// assign testing mode
app.node_env = 'testing';

describe('Account', function () {

    it('create account by with no email', function (done) {
        /*
        var result = {
            "data": [
                {
                    "code": "MISSING",
                    "field": "email",
                    "message": "Field is required"
                }
            ],
            "isResult": true,
            "message": "Unprocessable Entity: validation failed",
            "meta": {
                "error": "Unprocessable Entity",
                "message": "validation failed"
            },
            "statusCode": 422
        };
        */
        var result = {
            status: 'validation failed',
            errors: [{
                field: 'email',
                code: 'MISSING',
                message: 'Field is required'
            }]
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/create')
                .send({password: 'new_password'})
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });

    it('create account by with no password', function (done) {
        /*
        var result = {
            "data": [
                {
                    "code": "MISSING",
                    "field": "password",
                    "message": "Field is required"
                }
            ],
            "isResult": true,
            "message": "Unprocessable Entity: validation failed",
            "meta": {
                "error": "Unprocessable Entity",
                "message": "validation failed"
            },
            "statusCode": 422
        };
        */

        var result = {
            status: 'validation failed',
            errors: [{
                field: 'password',
                code: 'MISSING',
                message: 'Field is required'
            }]
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/create')
                .send({email: 'test@email.net'})
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);

                    done();
                });
        });
    });

    var temp = true;    // for now, temporary account initialize

    before(function(done){
        var Account = require('../core/models/account');
        var AccountToken = require('../core/models/accountToken');

        if (temp) {
            Account.remove({}, function (err, result) {
                done();
            });
        } else {
            done();
        }
    });

    var dummyAccount;       // for internal use only

    it('create account by email, password and optional nickname', function (done) {
        var result = {
            message: 'OK: '+i18n.t('account.create.done'),
            data: {
                "access_token": "e8e58304-dd29-4c03-8791-673e96a7f34e",
                "db_host": "db1.haroopress.com",
                "email": "test@email.net",
                "haroo_id": "b090e563d9c725ea48933efdeaa348fb4",
                "login_expire": "1422208905667",
                "profile": {
                    "gender": "",
                    "location": "",
                    "picture": "",
                    "website": ""
                }, "tokens": []

            },
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: i18n.t('account.create.done')}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/create')
                .set('x-access-host', 'supertest')
                .send({email: 'test@email.net', password: 'new_password'})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    //assert.deepEqual(res.body, result);
                    assert.deepEqual(res.body.data.db_host, result.data.db_host);
                    assert.deepEqual(res.body.data.haroo_id, result.data.haroo_id);
                    //assert.deepEqual(res.body.message, result.message);

                    // set new token for test only
                    dummyAccount = res.body.data;
                    dummyAccount.profile.nickname = "";

                    done();
                });
        });
    });

    it('login fail by invalid email or invalid password', function (done) {
        var result = {
            message: 'OK: '+i18n.t('account.read.mismatch'),
            data: {
                email: 'test@email.net',
                password: 'wrong_password',
                accessHost: 'supertest',
                accessIP: '127.0.0.1'
            },
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'none exist'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/login')
                .set('x-access-host', 'supertest')
                .send({email: 'test@email.net', password: 'wrong_password'})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    it('login success by email, password', function (done) {
        var result = {
            message: 'OK: done',
            data: {
                email: 'test@email.net',
                haroo_id: 'b090e563d9c725ea48933efdeaa348fb4',
                profile: {
                    nickname: '',
                    gender: '',
                    location: '',
                    website: '',
                    picture: ''
                },
                db_host: 'db1.haroopress.com',
                tokens: []
            },
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/login')
                .set('x-access-host', 'supertest')
                .send({email: 'test@email.net', password: 'new_password'})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    it("send mail to this account user for password reset but don't send mail actually", function (done) {
        var result = {
            message: 'OK: done',
            data: {
                email: 'test@email.net',
                haroo_id: 'b090e563d9c725ea48933efdeaa348fb4',
                profile: {
                    nickname: '',
                    gender: '',
                    location: '',
                    website: '',
                    picture: ''
                },
                db_host: 'db1.haroopress.com',
                tokens: []
            },
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/account/forgot_password')
                .set('x-access-host', 'supertest')
                .send({email: 'test@email.net'})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    it("validate token for non exist", function (done) {
        var result = {
            message: 'Bad Request: access deny',
            data: null,
            isResult: true,
            statusCode: 400,
            meta: {error: 'Bad Request', message: 'access deny'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/token/validate')
                .set('x-access-host', 'supertest')
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    it("validate token for keep", function (done) {
        // compare token
        var result = {
            message: 'OK: done',
            data: {
                accessToken: 'fb70f37a-cb0b-46a2-b30e-df8cac2d1346',
                accessHost: 'supertest',
                accessIP: '127.0.0.1'
            },
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'done'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/token/validate')
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body.message, result.message);
                    done();
                });
        });
    });

    it('get api service spec version', function (done) {
        var result = {
            message: 'OK: api version',
            data: {ver: '0.0.1', released: '2015-02-28T15:00:00.000Z'},
            isResult: true,
            statusCode: 200,
            meta: {error: 'OK', message: 'api version'}
        };

        app.init(app.node_env, function (server) {
            supertest(server)
                .post('/spec/version')
                .set('x-access-host', 'supertest')
                .set('x-access-token', dummyAccount.access_token)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    assert.ok(!err, err);
                    assert.deepEqual(res.body, result);
                    done();
                });
        });
    });

    describe('User', function () {
        it('access user api by Bad access token', function (done) {
            var result = {
                message: 'Bad Request: access deny',
                data: null,
                isResult: true,
                statusCode: 400,
                meta: {error: 'Bad Request', message: 'access deny'}
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .post('/user/' + dummyAccount.haroo_id + '/info')
                    .set('x-access-host', 'supertest')
                    .expect('Content-Type', /json/)
                    .expect(400)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body, result);
                        done();
                    });
            });
        });

        it('access user api by Expired access token', function (done) {
            // todo: need to patch or inject login expire date
            var result = {
                message: 'Bad Request: access deny',
                data: null,
                isResult: true,
                statusCode: 401,
                meta: {error: 'Bad Request', message: 'access deny'}
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .post('/user/' + dummyAccount.haroo_id + '/info')
                    .set('x-access-host', 'supertest')
                    .set('x-access-token', dummyAccount.access_token)
                    .expect('Content-Type', /json/)
                    .expect(401)
                    .end(function (err, res) {
                        //assert.ok(!err, err);
                        //assert.deepEqual(res.body, result);
                        done();
                    });
            })
        });

        it('get user account info by invalid harooID', function (done) {
            var result = {
                message: 'Bad Request: access deny',
                data: {
                    haroo_id: 'invalidHarooID',
                    accessToken: dummyAccount.access_token,
                    accessHost: 'supertest',
                    accessIP: '127.0.0.1'
                },
                isResult: true,
                statusCode: 400,
                meta: {error: 'Bad Request', message: 'access deny'}
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .post('/user/' + "invalidHarooID" + '/info')
                    .set('x-access-host', 'supertest')
                    .set('x-access-token', dummyAccount.access_token)
                    .expect('Content-Type', /json/)
                    .expect(400)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body, result);
                        done();
                    });
            })
        });

        it('get user account info by access token', function (done) {
            var result = {
                message: 'OK: done',
                data: dummyAccount,
                isResult: true,
                statusCode: 200,
                meta: {error: 'OK', message: 'done'}
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .post('/user/' + dummyAccount.haroo_id + '/info')
                    .set('x-access-host', 'supertest')
                    .set('x-access-token', dummyAccount.access_token)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body, result);
                        done();
                    });
            })
        });

        it('update user password by invalid email, password', function (done) {
            var result = {
                message: 'Bad Request: failed',
                data: {
                    haroo_id: 'b090e563d9c725ea48933efdeaa348fb4',
                    email: 'invalid@email.net',
                    password: 'anotherPassword',
                    accessHost: 'supertest',
                    accessIP: '127.0.0.1'
                },
                isResult: true,
                statusCode: 400,
                meta: {error: 'Bad Request', message: 'failed'}
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .post('/user/' + dummyAccount.haroo_id + '/change_password')
                    .set('x-access-host', 'supertest')
                    .set('x-access-token', dummyAccount.access_token)
                    .send({email: 'invalid@email.net', password: 'anotherPassword'})
                    .expect('Content-Type', /json/)
                    .expect(400)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body, result);
                        done();
                    });
            });
        });

        it('update user password by email, password and should valid access token', function (done) {
            var result = {
                message: 'OK: done',
                data: dummyAccount,
                isResult: true,
                statusCode: 200,
                meta: {error: 'OK', message: 'done'}
            };

            app.init(app.node_env, function (server) {
                supertest(server)
                    .post('/user/' + dummyAccount.haroo_id + '/change_password')
                    .set('x-access-host', 'supertest')
                    .set('x-access-token', dummyAccount.access_token)
                    .send({email: 'test@email.net', password: 'anotherPassword'})
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body, result);
                        done();
                    });
            });
        });

        it('update user profile by email and should valid access token', function (done) {
            var result = {
                message: 'OK: done',
                data: dummyAccount,
                isResult: true,
                statusCode: 200,
                meta: {error: 'OK', message: 'done'}
            };
            result.data.profile.nickname = '테스터1';

            app.init(app.node_env, function (server) {
                supertest(server)
                    .post('/user/' + dummyAccount.haroo_id + '/update_info')
                    .set('x-access-host', 'supertest')
                    .set('x-access-token', dummyAccount.access_token)
                    .send({email: 'test@email.net', nickname: '테스터1'})
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function (err, res) {
                        assert.ok(!err, err);
                        assert.deepEqual(res.body, result);
                        done();
                    });
            });
        });
    });
});