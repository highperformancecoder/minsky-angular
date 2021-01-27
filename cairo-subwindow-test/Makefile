MYCFLAGS=`pkg-config --cflags cairo xcb`
MYLDFLAGS=`pkg-config --libs --cflags cairo xcb x11`

all: main

%.o: %.c
	$(CC) -c $< -o $@ $(CFLAGS) $(CPPFLAGS) ${MYCFLAGS} 
%: %.c
	$(CC) $^ -o $@ $(CFLAGS) $(CPPFLAGS) ${MYCFLAGS} ${MYLDFLAGS} 
clean:
	rm -f $(PROGS) *.o


