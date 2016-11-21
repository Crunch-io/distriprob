distribution <- "studentsT"
mainPath <- "/Users/zacharymartin/Documents/ResultRepository/distriprob/test_cases"
casesFileName <- "generatedCases.json"

numValues <- 1000
result <- "["
cd <- runif(numValues);
dof1 <- sample(1:30, 200, replace = TRUE)
dof2 <- sample(1:100, 200, replace = TRUE)
dof3 <- sample(1:1000000, 200)
dof4 <- sample(1:4000000000, 200)
dof5 <- runif(40, 0, 1e+20)
dof6 <- runif(40, 0, 1e+40)
dof7 <- runif(40, 0, 1e+80)
dof8 <- runif(40, 0, 1e+160)
dof9 <- runif(40, 0, 1e+308)
dof <- c(dof1, dof2, dof3, dof4, dof5, dof6, dof7, dof8, dof9);

for (i in 1:numValues) {
  x <- qt(cd[i], dof[i])
  pd <- dt(x, dof[i])
  cdLower <- pt(x, dof[i], lower.tail = TRUE)
  cdUpper <- pt(x, dof[i], lower.tail = FALSE)
  quantileLower <- qt(cdLower, dof[i], lower.tail = TRUE)
  quantileUpper <- qt(cdLower, dof[i], lower.tail = FALSE)
  
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
