pdistribution <- "normal"
mainPath <- "/Users/zacharymartin/Documents/ResultRepository/distriprob/test_cases"
casesFileName <- "generatedCases.json"

numValues <- 1000
result <- "["
cd <- runif(numValues);
mu <- runif(numValues, min=-1000000, max=1000000)
sigma <- runif(numValues, min=0, max=1000000)

for (i in 1:numValues) {
  x <- qnorm(cd[i], mu[i], sigma[i])
  pd <- dnorm(x, mu[i], sigma[i])
  cdLower <- pnorm(x, mu[i], sigma[i], lower.tail = TRUE)
  cdUpper <- pnorm(x, mu[i], sigma[i], lower.tail = FALSE)
  quantileLower <- qnorm(cdLower, mu[i], sigma[i], lower.tail = TRUE)
  quantileUpper <- qnorm(cdLower, mu[i], sigma[i], lower.tail = FALSE)
  
  result <- paste(result, "\n  {", sep="")
  
  result <- paste(result, '\n    "mu": ', toString(mu[i]), ",", sep="")
  result <- paste(result, '\n    "sigma": ', toString(sigma[i]), ",", sep="")
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
