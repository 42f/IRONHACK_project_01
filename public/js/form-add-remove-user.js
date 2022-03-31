console.log('appel ok !');
const usersList = document.querySelector('#users-list')
// if ( elem.checked )
// $input.is( ":checked" )

usersList.addEventListener('click', (e)=>{
    console.log(e.target.closest('.row-user').dataset.userid)
    const userId = e.target.closest('.row-user').dataset.userid
    const checkbox = document.getElementById(userId)

    if(checkbox.hasAttribute('checked')){
        checkbox.removeAttribute('checked')
    }else{
        checkbox.setAttribute('checked', 'true')
    }

})
  