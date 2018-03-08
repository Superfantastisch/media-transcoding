library(httr)
library(jsonlite)
library(magrittr)
library(ggplot2)

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

# strip objectId
testData = testResult[,c("testType", "fileName", "resolution", "browser", "computerType", "createdOn", "testTime", "fileDuration", "testRunIndex")]
# factor data
testData$testType = as.factor(testData$testType)
testData$fileName = as.factor(testData$fileName)
testData$resolution = as.factor(testData$resolution)
testData$resolution = factor(testData$resolution, levels = c(0:2), labels = c("640x360", "960x540", "1280x720"))

testData$testTimeS = testData$testTime/1000
testData$testTimeS
# strip creation date
testData = testData[, c("testType", "fileName", "resolution", "browser", "computerType", "testTime", "fileDuration", "testRunIndex")]
class(testData$fileDuration)

# split dataframe by
wasmTestData = subset(testData, testType == "WebAssembly")
asmTestData = subset(testData, testType == "JavaScript")

# split by video length and resolution 640x360
wasmTestData_30_640 = subset(wasmTestData, fileDuration == 15 & resolution == "640x360")
asmTestData_30_640 = subset(asmTestData, fileDuration == 15 & resolution == "640x360")
summary(wasmTestData_30_640)
summary(asmTestData_30_640)

# split by video length and resolution 1280x720
wasmTestData_60_1280x720 = subset(wasmTestData, fileDuration == 60 & resolution == "1280x720")
asmTestData_60_1280x720 = subset(asmTestData, fileDuration == 60 & resolution == "1280x720")
summary(wasmTestData_60_1280x720)
summary(asmTestData_60_1280x720)

# create a box-plot
boxTestData_15_640 = subset(testData, fileDuration == 15 & resolution == "640x360")
boxTestData_60_1280 = subset(testData, fileDuration == 60 & resolution == "1280x720")

## create plot object and draw
performanceBoxPlot = ggplot(boxTestData_15_640, aes(testType, testTime))
performanceBoxPlot + geom_boxplot() + labs(x = "Technology", y = "Testresults in ms")

performanceBoxPlot = ggplot(boxTestData_60_1280, aes(testType, testTime))
performanceBoxPlot + geom_boxplot() + labs(x = "Technology", y = "Testresults in ms")

### try something 
boxTestData_60 = subset(testData, fileDuration == 60)
performanceBoxPlot = ggplot(boxTestData_60, aes(x = resolution, testTime, fill = testType))
performanceBoxPlot + geom_boxplot() + labs(x = "Technology", y = "Testresults in ms")

testData$testTimeM = testData$testTimeS/60

## performanceBoxPlot = ggplot(testData)
## performanceBoxPlot + geom_boxplot(aes(x = resolution, testTime, fill = testType)) + facet_grid(. ~ fileName) + scale_y_continuous(name = "Testresults in ms")

performanceBoxPlot = ggplot(subset(testData, fileDuration == 60 & resolution == "1280x720"))
performanceBoxPlot + geom_boxplot(aes(x = testType, testTimeM, fill = testType)) + scale_y_continuous(name = "Bla")