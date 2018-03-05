using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using media_transcoding_testApi.Model;
using Microsoft.AspNetCore.Mvc;

namespace media_transcoding_testApi.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class TestResultController : Controller
    {
        private readonly ITestResultRepository _testResultRepository;

        public TestResultController(ITestResultRepository testResultRepository) {
            _testResultRepository = testResultRepository;
        }

        // GET api/values        
        [HttpGet]
        public async Task<IEnumerable<TestResult>> Get() {
            return await _testResultRepository.GetAllTestResults();
        }

        //[HttpGet("{id}")]
        //public async Task<TestResult> Get(string id) {
        //    return await _testResultRepository.GetTestResult(id) ?? new TestResult();
        //}

        // POST api/notes - creates a new note
        [HttpPost]
        public void Post([FromBody] TestResultParam testResult) {
            _testResultRepository.AddTestResult(new TestResult {               
                FileName = testResult.FileName,
                CreatedOn = DateTime.Now,
                TestRunIndex = testResult.TestRunIndex,
                TestType = testResult.TestType,
                Resolution = testResult.Resolution,
                Browser = testResult.Browser,
                ComputerType = testResult.ComputerType,
                TestTime = testResult.TestTime,
                FileDuration = testResult.FileDuration
            });
        }

    }
}
