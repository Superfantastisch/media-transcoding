using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace media_transcoding_testApi.Model
{
    public class TestResultParam
    {
        public string TestType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string Resolution { get; set; } = string.Empty;
        public string Browser { get; set; } = string.Empty;
        public string ComputerType { get; set; } = string.Empty;       
        public int TestTime { get; set; } = 0;
        public int FileDuration { get; set; } = 0;
        public int TestRunIndex { get; set; } = 0;
    }
}
