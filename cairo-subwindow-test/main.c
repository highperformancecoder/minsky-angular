#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <cairo-xlib.h>
#include <X11/Xlib.h>

#define ewSizeX  1280
#define ewSizeY  720

//This function should give us a new x11 surface to draw on.
cairo_surface_t* create_x11_surface(Display *d, int width, int height,char *electronWindowId)
{
    int screen = DefaultScreen(d);
    //Drawable da =  XCreateSimpleWindow(d, DefaultRootWindow(d), 0, 0, x, y, 0, 0, 0);
    Drawable da = XCreateSimpleWindow(d, atoi(electronWindowId), 0, 200, ewSizeX, ewSizeY-200, 0, 0, 0);

    XSelectInput(d, da, ButtonPressMask | KeyPressMask);
    XMapWindow(d, da);

    cairo_surface_t* sfc = cairo_xlib_surface_create(d, da, DefaultVisual(d, screen), ewSizeX, ewSizeY-200);
    return sfc;
}

int main(int argc, char** argv)
{
    if (argc != 3) {
        printf("Usage %s  <initial_text> <windowId>\n", argv[0]);
        return 1;
    }

    Display *d = XOpenDisplay(NULL);
    if (d == NULL) {
        fprintf(stderr, "Failed to open display\n");
        return 1;
    }
    char *window_id = argv[2];

    //create a new cairo surface in an x11 window as well as a cairo_t* to draw
    //on the x11 window with.
    cairo_surface_t* surface = create_x11_surface(d, 600, 300,window_id);
    cairo_t* cr = cairo_create(surface);

    char *text = argv[1];
    size_t text_len = 0;

    if (argc != 3)
        text = NULL;
    else
        text_len = strlen(text);

    while(1)
    {
        printf("Clearing surface\n");
        // Clear the background
        cairo_move_to(cr, 0, 0);
        cairo_set_source_rgb(cr, 1, 1, 1);
        cairo_paint(cr);

        //draw some text
        cairo_select_font_face(cr, "serif", CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD);
        cairo_set_font_size(cr, 32.0);
        cairo_set_source_rgb(cr, 0.8, 0.8, 1.0);
        cairo_move_to(cr, 10.0, 25.0);

        if (text) {
            cairo_show_text(cr, text);
        }

        cairo_surface_flush(surface);
        XFlush(d);

        text=NULL;
        size_t len = 0;
        ssize_t lineSize = 0;
        lineSize = getline(&text, &len, stdin);
        
        if ((text)[lineSize - 1] == '\n') {
            (text)[lineSize - 1] = '\0';
            --lineSize;
        }


        if(strcmp(text, "quit") == 0) {
            printf("Got Quit Command %s\n", text);
            break;
        }
    }

    // XXX: Lots of other stuff isn't properly destroyed here
    cairo_surface_destroy(surface);
    return 0;
}
