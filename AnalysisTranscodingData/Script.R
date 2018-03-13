library(httr)
library(jsonlite)
library(magrittr)
library(ggplot2)
library(svglite)

# load data
testResultResponse <- GET("http://localhost:55556/api/testresult")
testResultResponse$status_code
testResultResponse$`content-type`
names(testResultResponse)

testResultContent <- content(testResultResponse, as = "text", encoding = "UTF-8")
testResultContent
write(testResultContent, "testResult.json")
write(testResultContent, "secondTestResult.json")
testResult = testResultContent %>% fromJSON
testResult
names(testResult)
summary(testResult)

# Make Data ready for analyses
## strip db objectId
testData = testResult[, c("testType", "fileName", "resolution", "browser", "computerType", "createdOn", "testTime", "fileDuration", "testRunIndex")]
summary(testData)

## factor data
testData$testType = as.factor(testData$testType)
testData$fileName = as.factor(testData$fileName)
testData$fileDuration = as.factor(testData$fileDuration)
testData$browser = as.factor(testData$browser)
testData$resolution = as.factor(testData$resolution)
testData$resolution = factor(testData$resolution, levels = c(0:2), labels = c("640x360", "960x540", "1280x720"))

## adjust time results
testData$testTimeS = testData$testTime/1000
testData$testTimeS
testData$testTimeM = testData$testTimeS / 60
testData$testTimeM

## strip creation date
testData = testData[, c("testType", "fileName", "resolution", "browser", "computerType", "testTime", "fileDuration", "testRunIndex")]
class(testData$fileDuration)

# Visualize results
## compare all results in one boxplot
performanceBoxPlot = ggplot(testData)
performanceBoxPlot + geom_boxplot(aes(x = resolution, testTimeM, fill = testType)) + facet_grid(. ~ fileName) + scale_y_continuous(name = "Testresults in minutes")
ggsave("performanceBoxPlot.svg")
ggsave("performanceBoxPlot.png")

## compore by video length and resolution
### blade-runner_15_h1080p.mov + Chrome
performanceBoxPlot_15_640 = ggplot(subset(testData, resolution == "640x360" & browser == "Chrome" & fileName == "blade-runner_15_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_15_640 + geom_boxplot() + labs(x = "640x360", y = "Testresults in seconds")
ggsave("performanceBoxPlot_15_640.svg")
ggsave("performanceBoxPlot_15_640.png")

performanceBoxPlot_15_960 = ggplot(subset(testData, resolution == "960x540" & browser == "Chrome" & fileName == "blade-runner_15_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_15_960 + geom_boxplot() + labs(x = "960x540", y = "Testresults in seconds")
ggsave("performanceBoxPlot_15_960.svg")
ggsave("performanceBoxPlot_15_960.png")

performanceBoxPlot_15_1280 = ggplot(subset(testData, resolution == "1280x720" & browser == "Chrome" & fileName == "blade-runner_15_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_15_1280 + geom_boxplot() + labs(x = "1280x720", y = "Testresults in seconds")
ggsave("performanceBoxPlot_15_1280.svg")
ggsave("performanceBoxPlot_15_1280.png")

### blade-runner_30_h1080p.mov + Chrome
performanceBoxPlot_30_640 = ggplot(subset(testData, resolution == "640x360" & browser == "Chrome" & fileName == "blade-runner_30_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_30_640 + geom_boxplot() + labs(x = "640x360", y = "Testresults in seconds")
ggsave("performanceBoxPlot_30_640.svg")
ggsave("performanceBoxPlot_30_640.png")

performanceBoxPlot_30_960 = ggplot(subset(testData, resolution == "960x540" & browser == "Chrome" & fileName == "blade-runner_30_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_30_960 + geom_boxplot() + labs(x = "960x540", y = "Testresults in seconds")
ggsave("performanceBoxPlot_30_960.svg")
ggsave("performanceBoxPlot_30_960.png")

performanceBoxPlot_30_1280 = ggplot(subset(testData, resolution == "1280x720" & browser == "Chrome" & fileName == "blade-runner_30_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_30_1280 + geom_boxplot() + labs(x = "1280x720", y = "Testresults in seconds")
ggsave("performanceBoxPlot_30_1280.svg")
ggsave("performanceBoxPlot_30_1280.png")

### blade-runner_60_h1080p.mov + Chrome
performanceBoxPlot_60_640 = ggplot(subset(testData, resolution == "640x360" & browser == "Chrome" & fileName == "blade-runner_60_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_60_640 + geom_boxplot() + labs(x = "640x360", y = "Testresults in seconds")
ggsave("performanceBoxPlot_60_640.svg")
ggsave("performanceBoxPlot_60_640.png")

performanceBoxPlot_60_960 = ggplot(subset(testData, resolution == "960x540" & browser == "Chrome" & fileName == "blade-runner_60_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_60_960 + geom_boxplot() + labs(x = "960x540", y = "Testresults in seconds")
ggsave("performanceBoxPlot_60_960.svg")
ggsave("performanceBoxPlot_60_960.png")

performanceBoxPlot_60_1280 = ggplot(subset(testData, resolution == "1280x720" & browser == "Chrome" & fileName == "blade-runner_60_h1080p.mov"), aes(x = testType, y = testTimeS, fill = testType))
performanceBoxPlot_60_1280 + geom_boxplot() + labs(x = "1280x720", y = "Testresults in seconds")
ggsave("performanceBoxPlot_60_1280.svg")
ggsave("performanceBoxPlot_60_1280.png")