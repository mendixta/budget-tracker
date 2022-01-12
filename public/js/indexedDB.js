let db;
const request = indexedDB.open("Budget_Tracker", 1);
const storeName = "new_transaction";

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore(storeName, { autoIncrement: true });
};

request.onerror = function () {
    console.log("There was an error!");
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadData();
    }
};

function saveRecord(record) {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    store.add(record);
}

function uploadData() {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(storeName, "readwrite");
                    const store = transaction.objectStore(storeName);
                    store.clear();
                });
        }
    };
}


window.addEventListener('online', uploadData);