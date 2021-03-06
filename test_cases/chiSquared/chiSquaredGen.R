
 #
 # (C) Copyright Zachary Martin 2016.
 # Use, modification and distribution are subject to the
 # Boost Software License:
 #
 # Permission is hereby granted, free of charge, to any person or organization
 # obtaining a copy of the software and accompanying documentation covered by
 # this license (the "Software") to use, reproduce, display, distribute,
 # execute, and transmit the Software, and to prepare derivative works of the
 # Software, and to permit third-parties to whom the Software is furnished to
 # do so, all subject to the following:
 #
 # The copyright notices in the Software and this entire statement, including
 # the above license grant, this restriction and the following disclaimer,
 # must be included in all copies of the Software, in whole or in part, and
 # all derivative works of the Software, unless such copies or derivative
 # works are solely in the form of machine-executable object code generated by
 # a source language processor.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 # FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT. IN NO EVENT
 # SHALL THE COPYRIGHT HOLDERS OR ANYONE DISTRIBUTING THE SOFTWARE BE LIABLE
 # FOR ANY DAMAGES OR OTHER LIABILITY, WHETHER IN CONTRACT, TORT OR OTHERWISE,
 # ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 # DEALINGS IN THE SOFTWARE.
 #


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
