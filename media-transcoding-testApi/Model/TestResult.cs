﻿using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace media_transcoding_testApi.Model
{
    public class TestResult
    {
        [BsonId]
        // standard BSonId generated by MongoDb
        public ObjectId InternalId { get; set; }

        // external ID or key, which may be easier to reference (ex: 1,2,3 etc.)
        // public string Id { get; set; }

        public string TestType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string Resolution { get; set; } = string.Empty;
        public string Browser { get; set; } = string.Empty;
        public string ComputerType { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; } = DateTime.Now;
        public int TestTime { get; set; } = 0;
        public int FileDuration { get; set; } = 0;
        public int TestRunIndex { get; set; } = 0;
    }
}