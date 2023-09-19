#byte_140003000 DATA
x = "49, 60, 67, 74, 63, 67, 42, 66, 80, 78, 69, 69, 7B, 99, 6D, 88, 68, 94, 9F, 8D, 4D, A5, 9D ,45".replace(" ","").split(",")
flag = []

for i in range(0,24):
	v = int(x[i],16) - (2*i)
	v = i ^ v
	flag.append(chr(v))

print("flag : "+"DH{"+"".join(flag)+"}")