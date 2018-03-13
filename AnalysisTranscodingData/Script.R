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

testResult <-fromJSON("testResult.json")

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
testData$testRunIndex = as.factor(testData$testRunIndex)

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

## view results by index in scatter plot
testData$fileName
trByIndex0 = ggplot(testData, aes(x = testRunIndex, y = testTimeM, colour = testType))
trByIndex0 + facet_grid(. ~ fileName) + geom_point() + labs(x = "Test run index", y = "Test result in minutes")
ggsave("trByIndex0.svg")
ggsave("trByIndex0.png")

trByIndex1 = ggplot(testData, aes(x = testRunIndex, y = testTimeM, colour = testType))
trByIndex1 + facet_grid(. ~ fileName) + geom_point() + geom_smooth(method = "lm", aes(fill = fileDuration)) + labs(x = "Test run index", y = "Test result in minutes")
ggsave("trByIndex1.svg")
ggsave("trByIndex1.png")

trByIndex2 = ggplot(testData, aes(x = testRunIndex, y = testTimeM, colour = testType))
trByIndex2 + facet_grid(resolution ~ fileName) + geom_point() + geom_smooth(method = "lm", aes(fill = fileDuration)) + labs(x = "Test run index", y = "Test result in minutes")
ggsave("trByIndex2.svg")
ggsave("trByIndex2.png")

## correlation matrix
sub_res_640 = subset(testData, resolution == "640x360" & browser == "Chrome")
sub_res_960 = subset(testData, resolution == "960x540" & browser == "Chrome")
sub_res_1280 = subset(testData, resolution == "1280x720" & browser == "Chrome")

sub_fileDuration_15 = subset(testData, fileDuration == 15 & browser == "Chrome")
sub_fileDuration_30 = subset(testData, fileDuration == 30 & browser == "Chrome")
sub_fileDuration_60 = subset(testData, fileDuration == 60 & browser == "Chrome")


resultDataFrame = data.frame(res_640 = sub_res_640$testTimeM, res_960 = sub_res_960$testTimeM, res_1280 = sub_res_1280$testTimeM, fileDuration_15 = sub_fileDuration_15$testTimeM, fileDuration_30 = sub_fileDuration_30$testTimeM, fileDuration_60 = sub_fileDuration_60$testTimeM)
cor(resultDataFrame)
pairs(~res_640 + res_960 + res_1280 + fileDuration_15 + fileDuration_30 + fileDuration_60, data = resultDataFrame, main = "Simple Scatterplot Matrix")


testData$xIndex = c(1:270)
allResultsPlot = ggplot(testData, aes(x = xIndex, y = testTimeM, colour = testType))
allResultsPlot + geom_point()

### resolution = 1280 zeit variable
was_15 = subset(sub_res_1280, testType == "WebAssembly" & fileDuration == 15)
was_30 = subset(sub_res_1280, testType == "WebAssembly" & fileDuration == 30)
was_60 = subset(sub_res_1280, testType == "WebAssembly" & fileDuration == 60)

webassembly_median = c(median(was_15$testTimeS), median(was_30$testTimeS), median(was_60$testTimeS))

js_15 = subset(sub_res_1280, testType == "JavaScript" & fileDuration == 15)
js_30 = subset(sub_res_1280, testType == "JavaScript" & fileDuration == 30)
js_60 = subset(sub_res_1280, testType == "JavaScript" & fileDuration == 60)

javascript_median = c(median(js_15$testTimeS), median(js_30$testTimeS), median(js_60$testTimeS))
webassembly_median
javascript_median

medPlotData = data.frame(js_median = javascript_median, wa_median = webassembly_median, xIndex = c(1:3))
medPlotData$wa_median
medPlotData$js_median


medPlot = ggplot(sub_res_1280, aes(fileDuration, testTimeS, colour = testType))
medPlot + stat_summary(fun.y = median, geom = "line", aes(group = testType))

medPlot + stat_summary(fun.y = median, geom = "line", aes(group = 1), linetype = "dashed")
#medPlot + geom_point(aes(y = js_median, colour = "red"))
medPlot + geom_point(aes(y = wa_median, colour = "blue"))