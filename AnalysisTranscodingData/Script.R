library(httr)
library(jsonlite)
library(magrittr)

testResultResponse <- GET("http://localhost:55556/api/testresult")
testResultResponse$status_code
testResultResponse$`content-type`
names(testResultResponse)

testResultContent <- content(testResultResponse, as = "text", encoding = "UTF-8")
testResultContent
write(testResultContent, "testResult.json")

testResult = testResultContent %>% fromJSON
testResult
names(testResult)
summary(testResult)

testResult$fileName

write.csv(testResult, "testResult.csv")