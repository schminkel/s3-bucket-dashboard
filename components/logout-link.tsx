'use client'

export function LogoutLink() {
  const handleLogout = () => {
    sessionStorage.removeItem('authenticated')
    window.location.reload()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-foreground underline underline-offset-2 hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0"
    >
      Logout
    </button>
  )
}
