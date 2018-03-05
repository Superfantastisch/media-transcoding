using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace media_transcoding_testApi.Model
{
    public class TestResultRepository : ITestResultRepository
    {
        private readonly TestResultContext _context = null;

        public TestResultRepository(IOptions<Settings> settings) {
            _context = new TestResultContext(settings);
        }

        public async Task<IEnumerable<TestResult>> GetAllTestResults() {
            try {
                return await _context.TestResults
                        .Find(_ => true).ToListAsync();
            }
            catch (Exception ex) {
                // log or manage the exception
                throw ex;
            }
        }

        // query after Id or InternalId (BSonId value)
        //
        //public async Task<TestResult> GetTestResult(ObjectId id) {
        //    try {
        //        ObjectId internalId = id;
        //        return await _context.TestResults
        //                        .Find(testResult => testResult.InternalId == id
        //                                || testResult.InternalId == internalId)
        //                        .FirstOrDefaultAsync();
        //    }
        //    catch (Exception ex) {
        //        // log or manage the exception
        //        throw ex;
        //    }
        //}

        private ObjectId GetInternalId(string id) {
            ObjectId internalId;
            if (!ObjectId.TryParse(id, out internalId))
                internalId = ObjectId.Empty;

            return internalId;
        }

        public async Task AddTestResult(TestResult item) {
            try {
                await _context.TestResults.InsertOneAsync(item);
            }
            catch (Exception ex) {
                // log or manage the exception
                throw ex;
            }
        }

        //public async Task<bool> RemoveNote(string id) {
        //    try {
        //        DeleteResult actionResult
        //            = await _context.Notes.DeleteOneAsync(
        //                Builders<Note>.Filter.Eq("Id", id));

        //        return actionResult.IsAcknowledged
        //            && actionResult.DeletedCount > 0;
        //    }
        //    catch (Exception ex) {
        //        // log or manage the exception
        //        throw ex;
        //    }
        //}

        //public async Task<bool> UpdateNote(string id, string body) {
        //    var filter = Builders<Note>.Filter.Eq(s => s.Id, id);
        //    var update = Builders<Note>.Update
        //                    .Set(s => s.Body, body)
        //                    .CurrentDate(s => s.UpdatedOn);

        //    try {
        //        UpdateResult actionResult
        //            = await _context.Notes.UpdateOneAsync(filter, update);

        //        return actionResult.IsAcknowledged
        //            && actionResult.ModifiedCount > 0;
        //    }
        //    catch (Exception ex) {
        //        // log or manage the exception
        //        throw ex;
        //    }
        //}

        //public async Task<bool> UpdateNote(string id, Note item) {
        //    try {
        //        ReplaceOneResult actionResult
        //            = await _context.Notes
        //                            .ReplaceOneAsync(n => n.Id.Equals(id)
        //                                    , item
        //                                    , new UpdateOptions { IsUpsert = true });
        //        return actionResult.IsAcknowledged
        //            && actionResult.ModifiedCount > 0;
        //    }
        //    catch (Exception ex) {
        //        // log or manage the exception
        //        throw ex;
        //    }
        //}

        //public async Task<bool> RemoveAllNotes() {
        //    try {
        //        DeleteResult actionResult
        //            = await _context.Notes.DeleteManyAsync(new BsonDocument());

        //        return actionResult.IsAcknowledged
        //            && actionResult.DeletedCount > 0;
        //    }
        //    catch (Exception ex) {
        //        // log or manage the exception
        //        throw ex;
        //    }
        //}
    }
}
