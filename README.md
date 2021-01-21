# list-report

# Application Structure

 The application consits of api and client side both served from the express 


## Installation

Please run npm install after downloading the project in to your local drive

```
npm install
```

## Start

Please run npm start 

```
npm start
```

You will get see the following in your console
[nodemon] starting `node app.js`
Example app listening on port 3000!

The application is availbale at http://localhost:3000/

## Upload

Please upload contact and listing csv files and select upload.

I had difficulties around joining the collections in the end, so please navigate to the following url after the reponse - documents imported successfully
http://localhost:3000/join

This will merge two collections based on listing id and the results can be seen in the terminal window.


After joining the collections, please navigate to this url to modify the object types.
Modifying the format of certain fields - price,mileage in int and date to date format

http://localhost:3000/change


## Acceptance criteria 1 : Average Listing Selling Price per Seller Type

please navigate to this url to see the results
http://localhost:3000/asp

## Acceptance criteria 2 : Percentual distribution of available cars by Make

please navigate to this url to see the results
http://localhost:3000/per

## Acceptance criteria 3 : Average price of the 30% most contacted listings
 Most contacted listing count was 141, so any count > 42 was taken in to account for calculating avg price

please navigate to this url to see the results
http://localhost:3000/top


## Acceptance criteria 4 : The Top 5 most contacted listings per Month
 I couldnt complete this rest endpoint, I had difficulties with aggregations based on month
