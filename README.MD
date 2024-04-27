# Tasks App


This is a simple Task application. Basically you can track tasks, comment about it, said finalize. Basically a task tracker. 


To initialize Task App just follow the directions bellow.

Windows:

Just open the command line and run initialize.bat file.
```
initialize.bat
```

Linux:

Just open the terminal and run.
```
chmod u+x initialize.sh
./initialize.sh
```

These script files will automatically install npm dependencies and create the example.db for the template. If you want to do it manually just open either command line/power shell under windows or terminal under linux and run these commands

```
npm install
```

Make sure both npm, sqlite3, and node are installed on your system if you decided to use Task App.

After all of this initialize just simple run...
node backend.js

```
node backend.js
```

This should run the application on localhost using port 3000 or simple goto
http://localhost:3000 if running.