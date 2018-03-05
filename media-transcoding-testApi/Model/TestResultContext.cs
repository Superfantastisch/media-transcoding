using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace media_transcoding_testApi.Model
{
    public class TestResultContext
    {
        private readonly IMongoDatabase _database = null;

        public TestResultContext(IOptions<Settings> settings) {
            var client = new MongoClient(settings.Value.ConnectionString);
            if (client != null)
                _database = client.GetDatabase(settings.Value.Database);
        }

        public IMongoCollection<TestResult> TestResults {
            get {
                return _database.GetCollection<TestResult>("TestResult");
            }
        }
    }
}
