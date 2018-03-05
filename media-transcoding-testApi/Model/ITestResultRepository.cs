using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace media_transcoding_testApi.Model
{
    public interface ITestResultRepository
    {
        Task<IEnumerable<TestResult>> GetAllTestResults();
        // Task<TestResult> GetTestResult(ObjectId InternalId);

        // add new note document
        Task AddTestResult(TestResult item);

        // remove a single document / note
        // Task<bool> RemoveNote(string id);

        // update just a single document / note
        // Task<bool> UpdateNote(string id, string body);

        // demo interface - full document update
        // Task<bool> UpdateNoteDocument(string id, string body);

        // should be used with high cautious, only in relation with demo setup
        // Task<bool> RemoveAllNotes();
    }
}
