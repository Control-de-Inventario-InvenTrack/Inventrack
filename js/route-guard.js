(function () {
  const loginPage = window.location.pathname.toLowerCase().endsWith('/login.html');
  let authenticated = false;

  try {
    const sessionValue = localStorage.getItem('inventrack_session');
    const session = sessionValue ? JSON.parse(sessionValue) : null;
    const usersValue = localStorage.getItem('inventrack_users');
    const users = usersValue ? JSON.parse(usersValue) : [];
    authenticated = Boolean(
      session
      && typeof session.userId === 'string'
      && Array.isArray(users)
      && users.some(user => user.id === session.userId)
    );
  } catch (error) {
    console.error('No se pudo validar el acceso almacenado.', error);
  }

  if (loginPage && authenticated) {
    window.location.replace('index.html');
    return;
  }
  if (!loginPage && !authenticated) {
    window.location.replace('login.html');
    return;
  }

  document.addEventListener('click', event => {
    const logoutButton = event.target.closest('#btn-logout');
    if (!logoutButton) return;

    event.preventDefault();
    localStorage.removeItem('inventrack_session');
    window.location.replace('login.html');
  });
})();
