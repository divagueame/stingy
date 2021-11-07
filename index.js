import {initializeApp} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js"
import {getFirestore, onSnapshot, doc, arrayUnion,setDoc, updateDoc, collection, query, where, getDoc, getDocs, addDoc} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js"
import {getAuth, onAuthStateChanged,createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut, GoogleAuthProvider, signInWithRedirect} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js"
// import { setTimeout } from "timers/promises";
// import { copyFileSync } from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyDFH-HvSyQ2nL2V0XWMV1dFyVrgna_HzBI",
  authDomain: "stingy-d49e9.firebaseapp.com",
  databaseURL: "https://stingy-d49e9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stingy-d49e9",
  storageBucket: "stingy-d49e9.appspot.com",
  messagingSenderId: "231992947759",
  appId: "1:231992947759:web:db2e29dd9249e36ff742da",
  measurementId: "G-ZKHW1F38FT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth();

const registerForm = document.getElementById('registerForm')
const logoutbtn = document.getElementById('logout-btn')
const logoutbtnWrapper = document.querySelector('.logout-btn-wrapper')
const loggedInWrapper = document.getElementById('loggedInWrapper')
const loggedOutWrapper = document.getElementById('loggedOutWrapper')
const menuDots = document.querySelector('.menu-dots');
const menuButtons = document.querySelector('.menu-buttons');

// const userInfoDiv = document.getElementById('userInfoDiv')
// const currentBillsDiv = document.getElementById('currentBillsDiv')


registerForm.addEventListener('submit', function(e){
  e.preventDefault()
  let newUsername = document.getElementById('username').value
  let newPassword = document.getElementById('password').value
  
signInWithEmailAndPassword(auth, newUsername, newPassword)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log("User in!")

  })
  .catch((error) => {
    console.log("User not found. Creating a new account")
    console.log(newUsername, newPassword)
    createUserWithEmailAndPassword(auth, newUsername,newPassword).then((userCredential) => {
      // User signed in.
      // console.log("Yes", userCredential.user)
      dbAddNewUser(userCredential.user)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Cannot create new account",errorCode)
      console.log(errorMessage)
    });
    const errorCode = error.code;
    const errorMessage = error.message;
  });
  
})




window.addEventListener('DOMContentLoaded', (event) => {
  onAuthStateChanged(auth, (user) => {
    //  User is logged in
    if (user) {
      const uid = user.uid;
      loggedOutWrapper.style.display = 'none'
      loggedInWrapper.style.display = 'flex'
      //On start, get current user
      let userO = getUserObj(user)
      
      userO.then((userObj)=>{
        // console.log("This is ",userObj.userName)
        getCurrentSharedBills(userObj.userInfo[0])
        //Add new bill btn
        const newBillWrapper = document.querySelector(".new-bill-wrapper");
        newBillWrapper.addEventListener('click', (e)=>{        
          addNewBill(userObj)
        })
      })
      
      
      // const menuDots = document.querySelector('.menu-dots');
      // menuButtons.style.display = 'none'
      // menuDots.style.display = 'flex'
      window.addEventListener('click', function(e){
        // console.log(menuDots)
        if (((e.target).parentElement==menuDots)||((e.target)==menuDots)){ // Open menu
          // menuDots.style.display = 'none'
          // menuButtons.style.display = 'flex'
          menuButtons.classList.add('menu-buttons-show')
        }
        else { //Close menu
          // menuDots.style.display = 'flex'
          // menuButtons.style.display = 'none '
          menuButtons.classList.remove('menu-buttons-show')
        }
      })
      

      let newbillbtn = document.createElement('button') 
      newbillbtn.innerHTML = 'Add new shared bill';
      newbillbtn.setAttribute('id', 'newbill-btn')
      // loggedInWrapper.insertBefore(newbillbtn, loggedInWrapper.firstChild);
      // loggedInWrapper.appendChild(newbillbtn)

      // let currentsharedbillsbtn = document.createElement('button') 
      // currentsharedbillsbtn.innerHTML = 'Show current shared bills';
      // currentsharedbillsbtn.setAttribute('id', 'currentsharedbills-btn')
      // currentsharedbillsbtn.addEventListener('click', function(){
      //   getCurrentSharedBills(user)
      // })
      
        
        logoutbtnWrapper.addEventListener('click', (e)=>{
          signOut(auth).then(() => {
            // Sign-out successful.
            console.log("USER IS LOGGED OUT")
          }).catch((error) => {
            // An error happened.
            console.log("Couldn't log out user")
          });
        })

        logoutbtn.addEventListener('click', function(){
              signOut(auth).then(() => {
                // Sign-out successful.
                console.log("USER IS LOGGED OUT")
              }).catch((error) => {
                // An error happened.
                console.log("COuldnt log out user")
              });
            })
    } else {   //User is logged out
      loggedOutWrapper.style.display = 'flex'
      loggedInWrapper.style.display = 'none'
    }
  })
} )

async function dbAddNewUser(user){
  let userArray = [user.uid,user.email]
  let userName = user.email.match(/^(.*?)\@/)
  await setDoc(doc(db, "users", user.uid), {
    'userInfo': userArray,
    'userName': userName[1]
  });
}

function addNewBill(userObj){
  // console.log("Add  New bill",userObj)
  // console.log("Add  New bill",userObj.userInfo[0])
  // let thisUserId = user.uid
  // console.log(thisUserId)
    const docRef = addDoc(collection(db, "bills"), {
    users: [userObj.userInfo[0]],
    usernames: [userObj.userName],
    moves: [
      // createPaymentObj(thisUserId,1,"Is"),
      // createPaymentObj(thisUserId,1,"Jess");
    ]
  }).then((e)=>{
    // console.log("Document written with ID: ", docRef.id);
    // console.log("Document written with ID: ", e.id);
  })

}

async function createPaymentObj(userId,payedAmount,paymentConcept){
  // console.log("Create")
  // console.log(userId)
  let thisUsername = await (retrieveUserName(userId));
  // console.log("Yes: thisis", thisUsername)
  return {
    date: new Date(),
    user: userId,
    username: thisUsername,
    amount: payedAmount,
    concept: paymentConcept
  }
}

function retrieveUserId(email){
  const q = query(collection(db, "users"), where("userInfo", "array-contains", email));
  return getDocs(q).then((es)=>{
    let found
    es.forEach((doc) => {
      found = doc.data()['userInfo'][0] 
      return found
    });
    return found
  })
}


function retrieveUserName(id){
  const q = query(collection(db, "users"), where("userInfo", "array-contains", id));
  return getDocs(q).then((es)=>{
    let found
    es.forEach((doc) => {
      // console.log("doc is: ", doc.data()['userName'])
      found = doc.data()['userName']
      return found
    });
    return found
  })
}


async function getCurrentSharedBills(userId){
  const bills = [];  
  const ids = [];
  const q = query(collection(db, "bills"), where("users", "array-contains", userId));
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change,i)=>{
      if (change.type === "added") {
        console.log("New bill: ", change.doc.data(), change.doc.id);
          // bills.push(change.doc.data());
          // ids.push(change.doc.id)
      let theseMoves = change.doc.data()['moves'];
      let theseUsers = change.doc.data()['usernames']
      let thisBalance = calculate_balance(theseMoves,userId)
      renderBillTitle(theseUsers,thisBalance,change.doc.id);
      renderBillContent(change.doc.data(),change.doc.id)

    }
    if (change.type === "modified") {
        console.log("Modified bill: ", change.doc.data());
        let theseMoves = change.doc.data()['moves'];
        let theseUsers = change.doc.data()['usernames']
        let thisBalance = calculate_balance(theseMoves,userId);
        removeBillTitle(change.doc.id);
        removeBillContent(change.doc.id)

        renderBillTitle(theseUsers,thisBalance,change.doc.id);
        renderBillContent(change.doc.data(),change.doc.id)
    }
    if (change.type === "removed") {
        console.log("Removed bill: ", change.doc.data());
    }
    
  }
      )
    });
}

function removeBillTitle(id){
  console.log("Remove this title: ", id)
  let thisId = `billwrapper${id}`;
  let elem = document.getElementById(thisId)
  elem.parentElement.removeChild(elem)
}
function removeBillContent(id){
  let thisId = `billmovedescription${id}`
  let elem = document.getElementById(thisId)
  elem.parentElement.removeChild(elem)
}

function calculate_balance(movesArray,thisUserId){
  let balance = 0;
  movesArray.forEach((move)=>{
    if(move.user==thisUserId){
      balance += parseInt((move.amount))
    }else {
      balance -= parseInt((move.amount))
    }
  })
// console.log(`This bill total balance is : ${balance}`)
  return balance
}

function renderBillTitle(names,balance,billId){
  // console.log("WE",billId)
  let namesTitle = '';
  names.forEach((name,i)=>{
    if(i==0){
      namesTitle = name
    }else {
      namesTitle = namesTitle + " & " + name
    }
    });
  // namesTitle = namesTitle.substr(0,15)
  // namesTitle += '...'

  const billWrapper = document.createElement('div')
  billWrapper.classList.add("bill-wrapper")
  billWrapper.classList.add("shadow")
  let wrapperId = `billwrapper${billId}`
  billWrapper.setAttribute('id',wrapperId)
    const billh2 = document.createElement('h2');
    billh2.innerHTML = namesTitle;
    const billBalance = document.createElement('div')
    billBalance.classList.add("bill-balance");
      const billBalanceTitle = document.createElement('div')
      billBalanceTitle.classList.add("bill-balance-title");
        const billBalanceDot = document.createElement('span')
        const billBalanceText = document.createElement('p');
      const billBalanceAmount = document.createElement('div')
      billBalanceAmount.classList.add("bill-balance-amount");
      billBalanceAmount.innerHTML= `${balance}€`;

  billWrapper.appendChild(billh2)
  billWrapper.appendChild(billBalance)
    billBalance.appendChild(billBalanceTitle)
      billBalanceTitle.appendChild(billBalanceDot)
      billBalanceTitle.appendChild(billBalanceText)
    billBalance.appendChild(billBalanceAmount)

  document.querySelector(".bills-list").appendChild(billWrapper)
  
  billWrapper.addEventListener('click', (e)=>{
    e.stopPropagation()
    e.stopImmediatePropagation();
    toggleBillMoveDescriptionDisplay(billId)
  })

}

function renderBillContent(bill,id){
  // console.log(bill,id)
  let billMoveDescription = document.createElement('div')
  billMoveDescription.classList.add("hidden-bill-move-description");
  
  let billMoveDescriptionId = `billmovedescription${id}`
  billMoveDescription.setAttribute('id',billMoveDescriptionId)

    let billMoveWrapper = document.createElement('div')
    let billMoveHeader = document.createElement('div')
    billMoveDescription.classList.add("bill-move-description");
    billMoveWrapper.classList.add("bill-move-wrapper");
    billMoveHeader.classList.add("shadow")
    billMoveHeader.classList.add("bill-move-header")
    billMoveHeader.innerHTML = "Title";
  billMoveWrapper.appendChild(billMoveHeader)


  bill.moves.forEach((move)=>{
    // console.log(move)
    let thisMoveDetailsDiv = document.createElement('div')
    thisMoveDetailsDiv.classList.add('bill-move-details')
    let billMoveDescriptionConcept = document.createElement('div')
    let billMoveDescriptionAmount = document.createElement('div')
    let billMoveDescriptionAuthor = document.createElement('div')
    let billMoveDescriptionDelete = document.createElement('div')
    billMoveDescriptionConcept.classList.add('bill-move-description-concept')
    billMoveDescriptionAmount.classList.add('bill-move-description-amount')
    billMoveDescriptionAuthor.classList.add('bill-move-description-author')
    billMoveDescriptionDelete.classList.add('bill-move-description-delete-btn')

    billMoveDescriptionConcept.innerHTML = move.concept
    billMoveDescriptionAmount.innerHTML = (move.amount + "€")
    billMoveDescriptionAuthor.innerHTML = move.username
    billMoveDescriptionDelete.innerHTML = 'x'

    thisMoveDetailsDiv.appendChild(billMoveDescriptionConcept)
    thisMoveDetailsDiv.appendChild(billMoveDescriptionAmount)
    thisMoveDetailsDiv.appendChild(billMoveDescriptionAuthor)
    thisMoveDetailsDiv.appendChild(billMoveDescriptionDelete)
    billMoveWrapper.appendChild(thisMoveDetailsDiv)
  })

  let billNewmoveBtn = document.createElement('button');
  billNewmoveBtn.classList.add("add-new-move-btn")
  billNewmoveBtn.classList.add("shadow")
  billNewmoveBtn.innerHTML = "+"
  billMoveWrapper.appendChild(billNewmoveBtn)
billMoveDescription.appendChild(billMoveWrapper)
let billDetailsDisplay = document.querySelector(".bill-details-display")
billDetailsDisplay.appendChild(billMoveDescription)

billNewmoveBtn.addEventListener('click', function(){
  displayNewMoveWrapper(bill);
  addNewMoveForm(bill,id)
  
})
}

function addNewMoveForm(bill,id){
  const newMoveForm = document.getElementById("new-move-form")
  newMoveForm.addEventListener('submit', function(e){
    e.preventDefault();
    e.stopImmediatePropagation()
    let newConcept = document.getElementById('new-move-concept').value
    let newAmount = document.getElementById('new-move-amount').value
    // console.log(newConcept,newAmount,bill)
    hideNewMoveWrapper()
    addNewMove(bill,newAmount,newConcept,id)
  }
  )
}




function renderBill(bill){
  // currentBillsDiv.textContent = ""
  // console.log("THIS",bill.id)
  let thisBillUsers = bill.data()['users']

  let thisBillDiv = document.createElement('div')
  thisBillDiv.classList.add("billListItem")

  thisBillUsers.forEach((userId)=>{
    let usersDiv = document.createElement('div');
    // retrieveUserName
    retrieveUserName(userId).then((userName)=>{
      
      usersDiv.innerHTML = userName
      // thisBillDiv.appendChild(usersDiv)
    })
    
    
  })
  // currentBillsDiv.appendChild(thisBillDiv)

  thisBillDiv.addEventListener('click', function(){
    renderCurrentBillInfo(bill)
  })
}

function renderCurrentBillInfo(bill){
  console.log("BIll is", bill)
  const currentBillInfo = document.getElementById('currentBillInfo')
  currentBillInfo.textContent = ""
  
  //Header
  let singleMoveDiv = renderBillHeader(bill)
  currentBillInfo.appendChild(singleMoveDiv)

  //Moves in this Bill
  bill.data().moves.forEach((singleMove)=>{
    let singleMoveDiv = renderSingleMoveDiv(singleMove)
    currentBillInfo.appendChild(singleMoveDiv)
  })

  //Add new move btn
  let addMoveBtn = document.createElement('button')
  addMoveBtn.innerHTML = "+"
  let newAmountMove = 69
  let newConcept = "Good stuff"
  // currentBillInfo.appendChild(addMoveBtn)
  // addNewMove(bill,newAmountMove, newConcept)
  
  
  //Add friend btn
  let addUserBtn = document.createElement('button')
  addUserBtn.innerHTML = "Add a friend to this bill"
  // currentBillInfo.appendChild(addUserBtn)

  addUserBtn.addEventListener('click', function(){
    toggleInputPanel()
  })
  

  // let newEmail = 'mike@mike.com'
  // retrieveUserId(newEmail)
  // .then((thisUserId)=>{
  //   // console.log("And we have this user id...", thisUserId)
  //   if (thisUserId!=undefined) {
  //     addUserBtn.addEventListener('click', function(){
  //       addNewUserToBill(thisUserId,bill)
  //      })
  //   }
   
  //   })
  // .catch((err)=>{
  //   alert(err.code, err.message)
  // })

    //Create hidden panel to add new user to a bill
    let newUserPanel = createNewPanel()
    // currentBillInfo.appendChild(newUserPanel)

}

function addNewUserToBill(newUserId,thisBill){
  let billRef = doc(db,"bills",thisBill.id)
  let newUsersArray = thisBill.data()['users']
  if(!newUsersArray.includes(newUserId)){
    newUsersArray.push(newUserId)  
  }
  setDoc(billRef, { 'users': newUsersArray }, { merge: true }); 
}

function renderBillHeader(bill){
  let returnDiv = document.createElement('div')
  returnDiv.classList.add("bill-header")
    let textDiv = document.createElement('div')
    textDiv.innerText = ''
    let dotsDiv = document.createElement('div')
    dotsDiv.classList.add("dots")
    // returnDiv.appendChild(textDiv)
    // returnDiv.appendChild(dotsDiv)
  return returnDiv
}

function renderSingleMoveDiv(move){
  console.log("As", move)
  let concept = move['concept']
  let amount = move['amount']

  let returnDiv = document.createElement('div')
  returnDiv.classList.add('singleMove')
  returnDiv.innerHTML = `${concept}, ${amount}`
  // returnDiv.innerHTML += move['user']
  return returnDiv
}



async function addNewMove(bill,amount,paymentConcept,billId){
  console.log(bill, "SA", billId)
  let userId = auth.currentUser.uid;
  let billRef = doc(db,"bills",billId)
  let movesArray = bill['moves']
  // console.log("as",movesArray)
  let newMove = await createPaymentObj(userId,amount,paymentConcept)
  movesArray.push(newMove)  
  // console.log(newMove)
    
  setDoc(billRef, { 'moves': movesArray }, { merge: true }).then((e)=>{
    console.log("Yes")
  }).catch((err)=>{
    console.log(err)
    console.log("ERROR")
  })



}

function createNewPanel(){
  let panel = document.createElement('div')
  panel.classList.add('add-new-user-panel')
  panel.classList.add('hidden-panel')
  
  let emailInput = document.createElement('input')
  emailInput.classList.add('add-email-text-input')
  emailInput.setAttribute('type','text')
  // emailInput.autofocus = true
  // panel.appendChild(emailInput)
  return panel
}

function toggleInputPanel(){
  document.querySelector('.add-new-user-panel').classList.toggle('hidden-panel');
  document.querySelector('.add-email-text-input').focus()
}

async function getUserObj(user){ 
  // console.log("ANd", user.uid)
const docRef = doc(db, "users", user.uid);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  // console.log("Document data:", docSnap.data());
  return docSnap.data()
} else {
  // doc.data() will be undefined in this case
  console.log("No such document!");
}

}

async function userBillsData(user){ 
    const q = query(collection(db, "bills"), where("users", "array-contains", user.uid));
    let myBills = await onSnapshot(q, (querySnapshot) => {
      let bills = []
      querySnapshot.forEach((bill) => {
        
        let billObj = bill.data()
        bills.push(billObj)
      });
      console.log(bills)
      // return bills; 
    }
    )
    // console.log("Current bills: ", myBills)
    return myBills
}

function displayNewMoveWrapper(b){
  console.log(b)
  const newMoveWrapper = document.querySelector('.new-move-wrapper')
  newMoveWrapper.classList.add('show-new-move-wrapper')
}

function hideNewMoveWrapper(){
  const newMoveWrapper = document.querySelector('.new-move-wrapper')
  newMoveWrapper.classList.remove('show-new-move-wrapper')
}


function toggleBillMoveDescriptionDisplay(id){
  const billDetailsDisplay = document.querySelector('.bill-details-display');
  for (let i = 0; i < billDetailsDisplay.children.length; i++) {
    if((billDetailsDisplay.children[i].id).substr(19)==id){
      billDetailsDisplay.children[i].classList.remove("hidden-bill-move-description")
    } else {
      billDetailsDisplay.children[i].classList.add("hidden-bill-move-description")
    }
  }
}