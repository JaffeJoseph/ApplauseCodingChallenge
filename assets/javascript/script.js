///////////////////////
//device id fetch
//////////////////////
var deviceRequest = new Request('http://localhost:3000/devices', {
    method: 'GET',
})

const devices = [];

fetch(deviceRequest)
    .then(blob => blob.json())
    .then(data => devices.push(...data))
    .catch(function(error) {
        console.log(error)
    });
//function returns device id's of 
function findDeviceIds(wordToMatch, devices) {
    var deviceList = devices.filter(device => {

        const regex = new RegExp(wordToMatch.replace(/(\S+\s+\S+)\s/, "$1|"), 'gi');
        console.log(regex);
        if (regex.test('all')) {
            return device.deviceId;
        } else {
            return device.description.match(regex);
        }
    });
    return deviceList.map(deviceIds => {
        return deviceIds.deviceId;
    });
}

///////////////////
///////////////////


///////////////////
//tester id fetch
///////////////////

var testerRequest = new Request('http://localhost:3000/testers', {
    method: 'GET',
})

const testers = [];

fetch(testerRequest)
    .then(blob => blob.json())
    .then(data => testers.push(...data))
    .catch(function(error) {
        console.log(error)
    });
//function returns device id's of 
function findTesterIds(wordToMatch, testers) {
    var testerList = testers.filter(tester => {

        const regex = new RegExp(wordToMatch.replace(/ /g, "|"), 'gi');
        if (regex.test('all')) {
            return tester.testerId;
        } else {
            return tester.country.match(regex);
        }
    });
    return testerList.map(testerIds => {
        return testerIds.testerId;
    });
}


///////////////////
///////////////////

///////////////////
//tester device fetch
///////////////////

var testerDeviceRequest = new Request('http://localhost:3000/tester_device', {
    method: 'GET',
})

const testerDevice = [];

fetch(testerDeviceRequest)
    .then(blob => blob.json())
    .then(data => testerDevice.push(...data))
    .catch(function(error) {
        console.log(error)
    });

function filterTesterIds(testerIdToMatch, testerDeviceArray) {
    var testerIndexes = [];
    testerIdToMatch.forEach(function(element) {

        testerIndexes = [...testerIndexes,
            ...(testerDeviceArray.filter(testerId => {
                if (testerId.testerId === element) {
                    return testerId;
                }
            }))
        ]
    });
    return testerIndexes;
}
//in this case we will use this function second in line to finish filtering the tester Device array
function filterDeviceIds(deviceIdToMatch, outputFromFilterTesterIds) {
    var deviceIndexes = [];
    deviceIdToMatch.forEach(function(element) {
        deviceIndexes = [...deviceIndexes,
            ...(outputFromFilterTesterIds.filter(deviceId => {
                if (deviceId.deviceId === element) {
                    return deviceId;
                }
            }))
        ]
    });
    return deviceIndexes;
}


///////////////////
///////////////////

///////////////////
//Count number of bugs in bugs json and return testerid with bug number sorted of form [[testerId1, bugs],[testerId2, bugs]]
///////////////////

var bugsRequest = new Request('http://localhost:3000/bugs', {
    method: 'GET',
})

const bugs = [];

fetch(bugsRequest)
    .then(blob => blob.json())
    .then(data => bugs.push(...data))
    .catch(function(error) {
        console.log(error)
    });

//takes in the filtered array from the previous section and the bugsArray json and returns an array of
//formant [[value1, value2],[value1, value2]...] where value1 is the testerId and value2 is the total bugs
function filterBugs(filteredInputArray, bugsArray) {
    var outputArray = [];
    var numInstances = [];
    var totalInstances = [];

    var length = 0;
    filteredInputArray.forEach(function(element) {
        outputArray = [...outputArray,
            ...bugsArray.filter(bugs => {
                if (bugs.deviceId === element.deviceId && bugs.testerId === element.testerId) {
                    return bugs;
                }
            })
        ]
        length = outputArray.length;
        outputArray = [];
        numInstances.push(length);

    });

    var refilteredInputArray = filteredInputArray.map(testerIds => {
        return testerIds.testerId;
    });



    var workingArray = _.zip(refilteredInputArray, numInstances);



    var returnObject = {};
    var returnArray = [];

    for (var i = 0; i < workingArray.length; i++) {
        var currValue = workingArray[i];
        if (returnObject[currValue[0]]) {
            returnObject[currValue[0]] = returnObject[currValue[0]] + currValue[1];
        } else {
            returnObject[currValue[0]] = currValue[1];
        }
    }



    for (var prop in returnObject) {
        if (returnObject.hasOwnProperty(prop)) {
            returnArray.push([parseInt(prop), returnObject[prop]]);
        }
    }





    //sort the final array by bug numbers

    function sortFunction(a, b) {
        if (a[1] === b[1]) {
            return 0;
        } else {
            return (a[1] > b[1]) ? -1 : 1;
        }
    }

    returnArray.sort(sortFunction);
    console.log(returnArray);
    return returnArray;
}

///////////////////
///////////////////

///////////////////
//Find Tester Names from tetesters json based on tester ids from filterbugs function
///////////////////

//will take array of arrays from previous section and return array of testers in same order
function createOrderedListOfTesters(array) {
    console.log(array);
    var arrayOfTesters = [];
    array.forEach(function(element) {
        arrayOfTesters = [...arrayOfTesters, ...(testers.filter(tester => {
            if (tester.testerId === element[0]) {
                return tester;
            }
        }))];
    });

    arrayOfTesters = arrayOfTesters.map(names => {
        return `${names.firstName} ${names.lastName}`
    });

    return arrayOfTesters;
}

///////////////////
///////////////////

//using all previously built functions to output desired users
function displayMatches() {
    const matchArray = createOrderedListOfTesters(filterBugs(filterDeviceIds(findDeviceIds(searchInputOne.value, devices), filterTesterIds(findTesterIds(searchInputTwo.value, testers), testerDevice)), bugs));
    const html = matchArray.map(tester => {
        return `
        <li>
          <span class="name">${tester}</span>
        </li>
      `;
    }).join('');
    suggestions.innerHTML = html;
}

const searchInputOne = document.querySelector('.search');
const searchInputTwo = document.querySelector('.countrySearch');
const suggestions = document.querySelector('.suggestions');

searchInputOne.addEventListener('change', displayMatches);
searchInputOne.addEventListener('keyup', displayMatches);



searchInputTwo.addEventListener('change', displayMatches);
searchInputTwo.addEventListener('keyup', displayMatches);