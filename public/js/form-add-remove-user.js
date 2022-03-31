console.log('appel ok !');
// const usersList = document.querySelector('#users-list')
// if ( elem.checked )
// $input.is( ":checked" )

// usersList.addEventListener('click', (e)=>{
//     // console.log(e.target.closest('.row-user').dataset.userid)
//     console.log(e.target)

//     const userId = e.target.closest('div.row-user').dataset.userid
//     const checkbox = document.getElementById(userId)

//     if(checkbox.hasAttribute('checked')){
//         checkbox.removeAttribute('checked')
//     }else{
//         checkbox.setAttribute('checked', 'true')
//     }

// })
  
const rowUser = document.querySelectorAll('.row-user')

rowUser.forEach(row=>{
    row.addEventListener('click', (e)=>{
        console.log(e.target);
        const userId = row.dataset.userid
        console.log(userId, 'USER ID ON CLIIIIICK');
        const checkbox = document.getElementById(userId)


        if(checkbox.hasAttribute('checked')){
            checkbox.removeAttribute('checked')
        }else{
            checkbox.setAttribute('checked', 'true')
        }

    })
})