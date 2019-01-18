process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

const request = supertest(app);

describe('/api', () => {
  beforeEach(() => connection.migrate.rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());
  it('Invalid End Point - URL does not exist should return status 404', () => request
    .get('/api/hello')
    .expect(404));
  describe('/api/topics', () => {
    it('Invalid DELETE Request - for /topics should return status 405 and error message', () => request
      .delete('/api/topics')
      .expect(405)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'method not allowed' });
      }));
    it('Invalid PATCH Request - for /topics should return status 405 and error message', () => request
      .patch('/api/topics')
      .expect(405)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'method not allowed' });
      }));
    describe('GET Requests for /api/topics/', () => {
      it('Valid GET Request - returns status 200 and an array of topic objects', () => request
        .get('/api/topics/')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.have.length(2);
          expect(body.topics[0]).to.eql({
            description: 'The man, the Mitch, the legend',
            slug: 'mitch',
          });
        }));
      it('Invalid GET Request - non-exisitent end point should return status 404', () => request
        .get('/api/topics/hello')
        .expect(404));
    });
    describe('POST Requests for /api/topics/', () => {
      it('Valid POST Request - valid slug which does not already exist returns status 201 and newly added topic', () => {
        const newTopic = {
          description: 'Next year\'s holiday',
          slug: 'italy',
        };
        return request
          .post('/api/topics/')
          .send(newTopic)
          .expect(201)
          .then(({ body }) => {
            expect(body.topic).to.eql(newTopic);
          });
      });
      it('Invalid POST Request - empty slug returns status 400 and error message', () => {
        const newTopic = {
          slug: '',
          description: 'a new topic',
        };
        return request
          .post('/api/topics/')
          .send(newTopic)
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({ msg: 'invalid data entry' });
          });
      });
      it('Invalid POST Request - slug already exists returns status 422 and error message', () => {
        const newTopic = {
          slug: 'cats',
          description: 'All the cats in the family',
        };
        return request
          .post('/api/topics/')
          .send(newTopic)
          .expect(422)
          .then(({ body }) => {
            expect(body).to.eql({ msg: 'new entry already exists' });
          });
      });
      it('Invalid POST Request - slug is a number returns status 400 and error message', () => {
        const newTopic = {
          slug: 1,
          description: 'a new topic',
        };
        return request
          .post('/api/topics/')
          .send(newTopic)
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({ msg: 'invalid data entry' });
          });
      });
      it('Invalid POST Request - valid slug but no description returns status 400 and error message', () => {
        const newTopic = {
          slug: 'dogs',
          description: '',
        };
        return request
          .post('/api/topics/')
          .send(newTopic)
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({ msg: 'invalid data entry' });
          });
      });
      it('Invalid POST Request - valid slug but description is a number returns status 400 and error message', () => {
        const newTopic = {
          slug: 'dogs',
          description: 14,
        };
        return request
          .post('/api/topics/')
          .send(newTopic)
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({ msg: 'invalid data entry' });
          });
      });
    });
    describe('/api/topics/:topic/articles', () => {
      it('Invalid DELETE Request - should return status 405 and error message', () => request
        .delete('/api/topics/cats/articles')
        .expect(405)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'method not allowed' });
        }));
      it('Invalid PATCH Request - should return status 405 and error message', () => request
        .patch('/api/topics/cats/articles')
        .expect(405)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'method not allowed' });
        }));
      describe('GET Requests for /api/topics/:topic/articles', () => {
        it('Valid GET Request - returns status 200 and an array of articles for the given topic ID', () => {
          const topic = 'cats';
          const expectedArticle = {
            author: 'rogersop',
            title: 'UNCOVERED: catspiracy to bring down democracy',
            article_id: 5,
            votes: 0,
            comment_count: '2',
            created_at: new Date(1037708514171).toJSON(),
            topic: 'cats',
          };
          return request
            .get(`/api/topics/${topic}/articles?limit=100`)
            .expect(200)
            .then(({ body }) => {
              console.log(body)
              expect(body.articles).to.have.length(1);
              expect(body.articles[0]).to.eql(expectedArticle);
            });
        });
        it('Invalid GET Request - invalid end point after :topic/ should return status 404', () => request
          .get('/api/topics/cats/hello')
          .expect(404));
        it('Invalid GET request - topic which does not exist should return status 404', () => {
          const topic = 'world';
          return request
            .get(`/api/topics/${topic}/articles`)
            .expect(404);
        });
        describe('GET Request Queries:', () => {
          describe('LIMIT Query:', () => {
            it('Valid limit query - returns status 200 and limits to 10 articles by default', () => {
              const topic = 'mitch';
              return request
                .get(`/api/topics/${topic}/articles/`)
                .expect(200)
                .then(({ body }) => {
                  expect(body.articles).to.have.length(10);
                });
            });
            it('Valid limit query - returns status 200 and limits to query amount', () => {
              const topic = 'mitch';
              const limit = 5;
              return request
                .get(`/api/topics/${topic}/articles?limit=${limit}`)
                .expect(200)
                .then(({ body }) => {
                  expect(body.articles).to.have.length(limit);
                });
            });
            it('Invalid limit query - string for limit should return status 400', () => {
              const topic = 'cats';
              return request
                .get(`/api/topics/${topic}/articles?limit=blah`)
                .expect(400);
            });
          });
          describe('SORT_BY Query:', () => {
            it('Valid sort_by query - returns status 200 and sort the articles by date by default', () => {
              const topic = 'mitch';
              const expectedTitle = 'Am I a cat?';
              return request
                .get(`/api/topics/${topic}/articles/`)
                .expect(200)
                .then(({ body }) => {
                  expect(body.articles[9].title).to.equal(expectedTitle);
                });
            });
            it('Valid sort_by query - should return status 200 and sort the articles by query column', () => {
              const topic = 'mitch';
              const expectedTitle = 'Z';
              return request
                .get(`/api/topics/${topic}/articles?sort_by=title`)
                .expect(200)
                .then(({ body }) => {
                  expect(body.articles[0].title).to.equal(expectedTitle);
                });
            });
            it('Invalid sort_by query - Invalid column name should return status 400', () => request
              .get('/api/topics/mitch/articles?sort_by=blah')
              .expect(400));
          });
          describe('PAGE Query:', () => {
            it('Valid p query - returns status 200 and starts the articles at page 1 by default', () => {
              const topic = 'mitch';
              const expectedTitle = 'Am I a cat?';
              return request
                .get(`/api/topics/${topic}/articles/`)
                .expect(200)
                .then(({ body }) => {
                  expect(body.articles[9].title).to.equal(expectedTitle);
                });
            });
            it('Valid p query - returns status 200 and starts the articles at the page query', () => {
              const topic = 'mitch';
              const expectedTitle = 'Moustache';
              return request
                .get(`/api/topics/${topic}/articles?p=2`)
                .expect(200)
                .then(({ body }) => {
                  expect(body.articles[0].title).to.equal(expectedTitle);
                });
            });
            it('Invalid p query - string for page should return status 400', () => {
              const topic = 'mitch';
              return request
                .get(`/api/topics/${topic}/articles?p=blah`)
                .expect(400);
            });
            it('Invalid p query - page that doesn\'t exist, return status 400', () => {
              const topic = 'mitch';
              return request
                .get(`/api/topics/${topic}/articles?p=4`)
                .expect(404);
            });
          });
          describe('SORT_ORDER Query:', () => {
            it('Valid sort_desc query - returns status 200 and sorts the articles in descending by default', () => {
              const topic = 'mitch';
              const expectedTitle = 'Does Mitch predate civilisation?';
              return request
                .get(`/api/topics/${topic}/articles/`)
                .expect(200)
                .then(({ body }) => {
                  expect(body.articles[6].title).to.equal(expectedTitle);
                });
            });
            it('Valid sort_asc query - returns status 200 and sorts the articles in ascending order as per query', () => {
              const topic = 'mitch';
              const expectedTitle = 'Sony Vaio; or, The Laptop';
              return request
                .get(`/api/topics/${topic}/articles?sort_ascending=true`)
                .expect(200)
                .then(({ body }) => {
                  expect(body.articles[9].title).to.equal(expectedTitle);
                });
            });
            it('Invalid sort_asc query - invalid string should use default and return status 200', () => {
              const topic = 'mitch';
              return request
                .get(`/api/topics/${topic}/articles?sort_ascending=hello`)
                .expect(200);
            });
          });
        });
      });
      describe('POST Request for /api/topics/:topic/articles', () => {
        it('Valid POST Request - object in the body returns status 201 and newly added article', () => {
          const topic = 'cats';
          const articleToSubmit = {
            title: 'Loki...the new addition to the family!',
            body: 'description about our new kitten.',
            username: 'rogersop',
          };
          return request
            .post(`/api/topics/${topic}/articles`)
            .send(articleToSubmit)
            .expect(201)
            .then(({ body }) => {
              expect(body.article[0].article_id).to.equal(13);
              expect(body.article[0].title).to.equal(articleToSubmit.title);
              expect(body.article[0].body).to.equal(articleToSubmit.body);
              expect(body.article[0].topic).to.equal(topic);
              expect(body.article[0].username).to.equal(articleToSubmit.username);
            });
        });
        it('Invalid POST Request - invalid title in body should return status 400', () => {
          const article = {
            title: 1324,
            body: 'this article is about my cat',
            username: 'butter_bridge',
          };
          return request
            .post('/api/topics/cats/articles')
            .send(article)
            .expect(400);
        });
        it('Invalid POST Request - invalid body in body should return status 400', () => {
          const article = {
            title: 'My cat Loki',
            body: '',
            username: 'butter_bridge',
          };
          return request
            .post('/api/topics/cats/articles')
            .send(article)
            .expect(400);
        });
        it('Invalid POST Request - valid data but invalid topic should return status 404', () => {
          const topic = 'dogs';
          const articleToSubmit = {
            title: 'Loki...the new addition to the family!',
            body: 'description about our new kitten.',
            username: 'rogersop',
          };
          return request
            .post(`/api/topics/${topic}/articles`)
            .send(articleToSubmit)
            .expect(404);
        });
      });
    });
  });
  describe('/api/articles', () => {
    it('Invalid POST Request - /articles should return status 405 and error message', () => request
      .post('/api/articles')
      .expect(405)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'method not allowed' });
      }));
    it('Invalid PATCH Request - /articles should return status 405 and error message', () => request
      .patch('/api/articles')
      .expect(405)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'method not allowed' });
      }));
    it('Invalid DELETE Request - /articles should return status 405 and error message', () => request
      .delete('/api/articles')
      .expect(405)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'method not allowed' });
      }));
    describe('GET Request for /api/articles', () => {
      it('Valid GET Request - returns status 200 and an array of article objects', () => request
        .get('/api/articles/')
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.have.length(10);
          expect(body.articles[0]).to.eql({
            author: 'butter_bridge',
            title: 'Living in the shadow of a great man',
            article_id: 1,
            votes: 100,
            comment_count: '13',
            created_at: new Date(1542284514171).toJSON(),
            topic: 'mitch',
          });
        }));
      describe('GET Request Queries', () => {
        describe('LIMIT Query:', () => {
          it('Valid limit query - returns status 200 and limits to 10 articles by default', () => request
            .get('/api/articles/')
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).to.have.length(10);
            }));
          it('valid limit query - returns status 200 and limits to query amount', () => {
            const limit = 5;
            return request
              .get(`/api/articles?limit=${limit}`)
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).to.have.length(limit);
              });
          });
          it('Invalid limit query - string for limit should return status 400', () => request
            .get('/api/articles?limit=blah')
            .expect(400));
        });
        describe('SORT_BY Query:', () => {
          it('Valid sort_by query - returns status 200 and sorts the articles by date by default', () => {
            const expectedTitle = 'Seven inspirational thought leaders from Manchester UK';
            return request
              .get('/api/articles/')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[9].title).to.equal(expectedTitle);
              });
          });
          it('Valid sort_by query - returns status 200 and sorts the articles by query column', () => {
            const expectedTitle = 'Does Mitch predate civilisation?';
            return request
              .get('/api/articles?sort_by=title')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[9].title).to.equal(expectedTitle);
              });
          });
          it('Invalid sort_by query - Invalid column name should return status 400', () => request
            .get('/api/articles?sort_by=blah')
            .expect(400));
        });
        describe('PAGE Query:', () => {
          it('Valid p query - returns status 200 and starts the articles at page 1 by default', () => {
            const expectedArticleId = 10;
            return request
              .get('/api/articles/')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[9].article_id).to.equal(expectedArticleId);
              });
          });
          it('Valid p query - returns status 200 and starts the articles at the page query', () => {
            const expectedArticleId = 11;
            return request
              .get('/api/articles?p=2')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[0].article_id).to.equal(expectedArticleId);
              });
          });
          it('Invalid p query - string for page should use default and return status 400', () => request
            .get('/api/articles?p=blah')
            .expect(400));
          it('Invalid p query - page that doesn\'t exist, return status 404', () => request
            .get('/api/articles?p=4')
            .expect(404));
        });
        describe('SORT_ORDER Query:', () => {
          it('Valid sort_desc query - returns status 200 and sorts the articles in descending by default', () => {
            const expectedTitle = 'Z';
            return request
              .get('/api/articles/')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[6].title).to.equal(expectedTitle);
              });
          });
          it('Valid sort_asc query - returns status 200 and sorts the articles in ascending order as per query', () => {
            const expectedTitle = 'Eight pug gifs that remind me of mitch';
            return request
              .get('/api/articles?sort_ascending=true')
              .expect(200)
              .then(({ body }) => {
                expect(body.articles[9].title).to.equal(expectedTitle);
              });
          });
          it('Invalid sort_asc query - string for sort_asc should use default and return status 200', () => request
            .get('/api/articles?sort_ascending=hello')
            .expect(200));
        });
      });
    });
    describe('/api/articles/:article_id', () => {
      it('Invalid POST Request - /articles/:article_id should return status 405 and error message', () => request
        .post('/api/articles/1')
        .expect(405)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'method not allowed' });
        }));
      describe('GET Requests for /api/articles/:article_id', () => {
        it('Valid GET Request - article_id returns status 200 and the article object', () => {
          const article_id = 5;
          const expectedArticle = {
            author: 'rogersop',
            title: 'UNCOVERED: catspiracy to bring down democracy',
            article_id: 5,
            body: 'Bastet walks amongst us, and the cats are taking arms!',
            votes: 0,
            created_at: '2002-11-19T12:21:54.171Z',
            topic: 'cats',
            comment_count: '2',
          };
          return request
            .get(`/api/articles/${article_id}`)
            .expect(200)
            .then(({ body }) => {
              expect(body.article).to.eql(expectedArticle);
            });
        });
        it('Invalid GET Request - article_id with invalid id should return status 404', () => request
          .get('/api/articles/100')
          .expect(404));
      });
      describe('PATCH Requests for /api/articles/:article_id', () => {
        it('Valid PATCH Request - object for increasing votes returns status 200', () => {
          const article_id = 1;
          const updateVotes = {
            inc_votes: 5,
          };
          return request
            .patch(`/api/articles/${article_id}`)
            .send(updateVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.article[0].votes).to.equal(105);
            });
        });
        it('Valid PATCH Request - object for decreasing votes returns status 200', () => {
          const article_id = 1;
          const updateVotes = {
            inc_votes: -5,
          };
          return request
            .patch(`/api/articles/${article_id}`)
            .send(updateVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.article[0].votes).to.equal(95);
            });
        });
        it('Invalid PATCH Request - with invalid ID should return status 404', () => {
          const updateVotes = {
            inc_votes: 5,
          };
          return request
            .patch('/api/articles/100')
            .send(updateVotes)
            .expect(404);
        });
        it('Invalid PATCH Request - with empty string should return status 400', () => {
          const article_id = 1;
          const updateVotes = {
            inc_votes: '',
          };
          return request
            .patch(`/api/articles/${article_id}`)
            .send(updateVotes)
            .expect(400);
        });
        it('Invalid PATCH Request - with empty body should return status 200 and unchanged article', () => {
          const article_id = 1;
          const updateVotes = {
          };
          return request
            .patch(`/api/articles/${article_id}`)
            .send(updateVotes)
            .expect(200)
            .then(({ body }) => {
              expect(body.article[0].votes).to.equal(100);
            });
        });
      });
      describe('DELETE Requests for /api/articles/:article_id', () => {
        it('Valid DELETE Request - article_id returns status 204 and an empty object, then does a GET request for the same article ID and returns 404', () => {
          const article_id = 1;
          return request
            .delete(`/api/articles/${article_id}`)
            .expect(204)
            .then(() => request
              .get(`/api/articles/${article_id}`)
              .expect(404));
        });
        it('Invalid DELETE Request - invalid article_id should return status 404', () => request
          .delete('/api/articles/100')
          .expect(404));
      });
      describe('/api/articles/:article_id/comments', () => {
        it('Invalid PATCH Request - /api/articles/:article_id/comments should return status 405', () => request
          .patch('/api/articles/1/comments')
          .expect(405));
        it('Invalid DELETE Request - /api/articles/:article_id/comments should return status 405', () => request
          .delete('/api/articles/1/comments')
          .expect(405));
        describe('GET Requests for /api/articles/:article_id/comments', () => {
          it('Valid GET Request - returns status 200 and an array of comments for article_id', () => {
            request
              .get('/api/articles/1/comments')
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.have.length(10);
                expect(body.comments[0]).to.have.all.keys('comment_id', 'votes', 'created_at', 'author', 'body');
              });
          });
          it('Invalid GET Request - invalid article_id should return status 404', () => request
            .get('/api/articles/100/comments')
            .expect(404));
          describe('GET Request Queries', () => {
            describe('LIMIT Query:', () => {
              it('Valid limit query - returns status 200 and limits to 10 comments by default', () => request
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.have.length(10);
                }));
              it('Valid limit query - returns status 200 and limits to query amount', () => request
                .get('/api/articles/1/comments?limit=5')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments).to.have.length(5);
                }));
              it('Invalid limit query - string for limit should use default and return status 200', () => request
                .get('/api/articles/1/comments?limit=blah')
                .expect(200));
            });
            describe('SORT_BY Query:', () => {
              it('Valid sort_by query - returns status 200 and sorts the comments by date by default', () => request
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[9].comment_id).to.equal(11);
                }));
              it('Valid sort_by query - returns status 200 and sorts the comments by the query column', () => request
                .get('/api/articles/1/comments?sort_by=comment_id')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[9].comment_id).to.equal(5);
                }));
              it('Invalid sort_by query - Invalid column name should return status 400', () => request
                .get('/api/articles/1/comments?sort_by=blah')
                .expect(400));
            });
            describe('PAGE Query:', () => {
              it('Valid p query - returns status 200 and starts the comments at page 1 by default', () => request
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[9].comment_id).to.equal(11);
                }));
              it('Valid p query - returns status 200 and starts the comments at the page query', () => request
                .get('/api/articles/1/comments?p=2')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[0].comment_id).to.equal(12);
                }));
              it('Invalid p query - string for page should use default and return status 200', () => request
                .get('/api/articles/1/comments?p=blah')
                .expect(200));
              it('Invalid p query - page that doesn\'t exist should return status 400', () => request
                .get('/api/articles/1/comments?p=5')
                .expect(404));
            });
            describe('SORT_ORDER Query:', () => {
              it('Valid sort_desc query - returns status 200 and sorts the comments in descending by default', () => request
                .get('/api/articles/1/comments')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[6].comment_id).to.equal(8);
                }));
              it('Valid sort_asc query - returns status 200 and sorts the comments in ascending order as per query', () => request
                .get('/api/articles/1/comments?sort_ascending=true')
                .expect(200)
                .then(({ body }) => {
                  expect(body.comments[9].comment_id).to.equal(5);
                }));
              it('Invalid sort_asc query - strong for sort should use default and return status 200', () => request
                .get('/api/articles/1/comments?sort_ascending=hello')
                .expect(200));
            });
          });
        });
        describe('POST Requests for /api/articles/:article_id/comments', () => {
          it('Valid POST Request - returns status 201 and newly added comment', () => {
            const commentToAdd = {
              username: 'icellusedkars',
              body: 'fantastic article',
            };
            return request
              .post('/api/articles/1/comments')
              .send(commentToAdd)
              .expect(201)
              .then(({ body }) => {
                expect(body.comment).to.have.all.keys('comment_id', 'username', 'article_id', 'votes', 'created_at', 'body');
                expect(body.comment.body).to.eql(commentToAdd.body);
              });
          });
          it('Invalid POST Request - invalid article_id should return status 404', () => {
            const commentToAdd = {
              username: 'icellusedkars',
              body: 'great article',
            };
            return request
              .post('/api/articles/100/comments')
              .send(commentToAdd)
              .expect(404);
          });
          it('Invalid POST Request - invalid data type should return status 400', () => {
            const commentToAdd = {
              username: 'icellusedkars',
              body: 1,
            };
            return request
              .post('/api/articles/1/comments')
              .send(commentToAdd)
              .expect(400);
          });
          it('Invalid POST Request - incomplete data should return status 400', () => {
            const commentToAdd = {
              username: '',
              body: 'fantastic article',
            };
            return request
              .post('/api/articles/1/comments')
              .send(commentToAdd)
              .expect(400);
          });
        });
        describe('/api/articles/:article_id/comments/:comment_id', () => {
          it('Invalid GET Request - /api/articles/:article_id/comments/:comment_id should return status 405', () => request
            .get('/api/articles/1/comments/5')
            .expect(405));
          it('Invalid POST Request - /api/articles/:article_id/comments/:comment_id should return status 405', () => request
            .post('/api/articles/1/comments/5')
            .expect(405));
          describe('PATCH Requests for /api/articles/:article_id/comments/:comment_id', () => {
            it('Valid PATCH Request - increasing votes for comment returns status 200', () => {
              const article_id = 1;
              const comment_id = 5;
              const updateVotes = {
                inc_votes: 5,
              };
              return request
                .patch(`/api/articles/${article_id}/comments/${comment_id}`)
                .send(updateVotes)
                .expect(200)
                .then(({ body }) => {
                  expect(body.comment[0].votes).to.equal(5);
                });
            });
            it('Valid PATCH Request - decreasing votes for comment returns status 200', () => {
              const article_id = 1;
              const comment_id = 2;
              const updateVotes = {
                inc_votes: -5,
              };
              return request
                .patch(`/api/articles/${article_id}/comments/${comment_id}`)
                .send(updateVotes)
                .expect(200)
                .then(({ body }) => {
                  expect(body.comment[0].votes).to.equal(9);
                });
            });
            it('Invalid PATCH Request - invalid comment_id should return status 400', () => request
              .patch('/api/articles/1/comments/100')
              .expect(400));
            it('Invalid PATCH Request - invalid article ID should return status 400', () => {
              const article_id = 100;
              const comment_id = 2;
              const updateVotes = {
                inc_votes: 5,
              };
              return request
                .patch(`/api/articles/${article_id}/comments/${comment_id}`)
                .send(updateVotes)
                .expect(400);
            });
            it('Invalid PATCH Request - invalid request should return status 400', () => {
              const article_id = 1;
              const comment_id = 2;
              const updateVotes = {
                inc_votes: '',
              };
              return request
                .patch(`/api/articles/${article_id}/comments/${comment_id}`)
                .send(updateVotes)
                .expect(400);
            });
            it('Invalid PATCH Request - empty body should return status 200 and unchanged body', () => {
              const article_id = 1;
              const comment_id = 2;
              const updateVotes = {
              };
              return request
                .patch(`/api/articles/${article_id}/comments/${comment_id}`)
                .send(updateVotes)
                .expect(200)
                .then(({ body }) => {
                  expect(body.comment[0].votes).to.equal(14);
                });
            });
          });
          describe('DELETE Requests for /api/articles/:article_id/comments/:comment_id', () => {
            it('Valid DELETE Request - returns status 204 and an empty object, then does a GET request for the same article ID and returns 404', () => {
              const article_id = 1;
              const comment_id = 2;
              return request
                .delete(`/api/articles/${article_id}/comments/${comment_id}`)
                .expect(204)
                .then(() => request
                  .get(`/api/articles/${article_id}/comments${comment_id}`)
                  .expect(404));
            });
            it('Invalid DELETE Request - invalid comment_id should return status 404', () => request
              .delete('/api/articles/1/comments/100')
              .expect(404));
            it('Invalid DELETE Request - valid comment_id but invalid article_id should return status 404', () => request
              .delete('/api/articles/100/comments/2')
              .expect(404));
          });
        });
      });
    });
  });
  describe('/api/users', () => {
    it('Invalid DELETE Request - /users should return status 405 and error message', () => {
      request
        .delete('/api/users')
        .expect(405)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'method not allowed' });
        });
    });
    it('Invalid PATCH Request - /users should return status 405 and error message', () => {
      request
        .patch('/api/users')
        .expect(405)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'method not allowed' });
        });
    });
    describe('GET Request for /api/users', () => {
      it('Valid GET Requests - returns status 200 and an array of all user objects', () => {
        request
          .get('/api/users/')
          .expect(200)
          .then(({ body }) => {
            expect(Object.keys(body.users).length).to.equal(3);
            expect(body.users).to.have.all.keys('username', 'name', 'avatar_url');
          });
      });
      it('Invalid GET Request - invalid end point after /users should return status 404', () => request
        .get('/api/usershello')
        .expect(404));
    });
    describe('POST Request for /api/users', () => {
      it('Valid POST Request - with new user in the body, returns status 201 the newly added user', () => {
        const newUser = {
          username: 'samueljai',
          name: 'samuel',
          avatar_url: 'https://www.samueljdesai.com/photo.jpg',
        };
        return request
          .post('/api/users/')
          .send(newUser)
          .expect(201)
          .then(({ body }) => {
            expect(body.user).to.eql(newUser);
          });
      });
      it('Invalid POST Request - with existing username, returns status 422 and error message', () => {
        const newUser = {
          username: 'butter_bridge',
          name: 'samuel',
          avatar_url: 'https://www.samueljdesai.com/photo.jpg',
        };
        return request
          .post('/api/users/')
          .send(newUser)
          .expect(422)
          .then(({ body }) => {
            expect(body).to.eql({ msg: 'new entry already exists' });
          });
      });
    });
    describe('/api/users/:username', () => {
      it('Invalid POST Request - /users/:username, returns status 405', () => request
        .post('/api/users/rogersop')
        .expect(405));
      it('Invalid DELETE Request - /users/:username should return status 405', () => request
        .delete('/api/users/rogersop')
        .expect(405));
      it('Invalid PATCH Request - /users/:username should return status 405', () => request
        .patch('/api/users/rogersop')
        .expect(405));
      describe('GET Request for /api/users/:username', () => {
        it('Valid GET Request - with username returns status 200 and the user object', () => {
          const username = 'icellusedkars';
          const expectedUser = {
            username: 'icellusedkars',
            name: 'sam',
            avatar_url: 'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4',
          };
          return request
            .get(`/api/users/${username}`)
            .expect(200)
            .then(({ body }) => {
              expect(body.user).to.eql(expectedUser);
            });
        });
        it('Invalid GET Request - with invalid username returns status 404', () => request
          .get('/api/users/hello')
          .expect(404));
      });
    });
  });
});
