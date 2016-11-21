distribution <- "chiSquared"
mainPath <- "/Users/zacharymartin/Documents/ResultRepository/distriprob/test_cases"
casesFileName <- "generatedCases.json"

numValues <- 1000
result <- "["
cd <- runif(numValues);
smallDOF <- sample(1:1000, (numValues/2) + 1)
largeDOF <- sample(1:1000000, (numValues/2))
dof <- c(smallDOF, largeDOF);

for (i in 1:numValues) {
  x <- qchisq(cd[i], dof[i])
  pd <- dchisq(x, dof[i])
  cdLower <- pchisq(x, dof[i], lower.tail = TRUE)
  cdUpper <- pchisq(x, dof[i], lower.tail = FALSE)
  quantileLower <- qchisq(cdLower, dof[i], lower.tail = TRUE)
  quantileUpper <- qchisq(cdLower, dof[i], lower.tail = FALSE)
  
  result <- paste(result, "\n  {", sep="")
  
  result <- paste(result, '\n    "dof": ', toString(dof[i]), ",", sep="")
  result <- paste(result, '\n    "x": ', toString(x), ",", sep="")
  result <- paste(result, '\n    "pd": ', toString(pd), ",", sep="")
  result <- paste(result, '\n    "cdLower": ', toString(cdLower), ",", sep="")
  result <- paste(result, '\n    "cdUpper": ', toString(cdUpper), ",", sep="")
  result <- paste(result, '\n    "quantileLLower": ', toString(quantileLower), ",", sep="")
  result <- paste(result, '\n    "quantileLUpper": ', toString(quantileUpper), sep="")
  
  result <- paste(result, "\n  }", sep="")
  
  if (i != numValues) {
    result <- paste(result, ",", sep="")
  }
}

result <- paste(result, "\n]", sep="");

if (!dir.exists(file.path(mainPath, distribution))) {
  dir.create(file.path(mainPath, distribution))
}

if (file.exists(file.path(mainPath, distribution, casesFileName))) {
  file.remove(file.path(mainPath, distribution, casesFileName))
}

write(result, file=file.path(mainPath, distribution, casesFileName))
