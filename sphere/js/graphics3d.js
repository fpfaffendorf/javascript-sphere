// --------------------------------------------------------------------------------------
// Graphics3d Class Definition
// --------------------------------------------------------------------------------------
var Graphics3d = function(canvasId, thitaX, thitaY, fov)
{

    // Canvas
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");

    // Camera aspect
    this.thitaX = thitaX;
    this.thitaY = thitaY;
    this.aspect = 1;
    this.fov = fov;
    this.nearZ = 1;
    this.farZ = 100;

    // Y axis rotation matrix
    this.rotateY = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.rotateY[0][0] = Math.cos(this.thitaY);
    this.rotateY[0][2] = Math.sin(this.thitaY) * -1;
    this.rotateY[1][1] = 1;
    this.rotateY[2][0] = Math.sin(this.thitaY);
    this.rotateY[2][2] = Math.cos(this.thitaY);

    // X axis rotation matrix
    this.rotateX = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.rotateX[0][0] = 1;
    this.rotateX[1][1] = Math.cos(this.thitaX);
    this.rotateX[1][2] = Math.sin(this.thitaX);
    this.rotateX[2][1] = Math.sin(this.thitaX) * -1;
    this.rotateX[2][2] = Math.cos(this.thitaX);

    // Camera matrix
    this.camera = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    this.camera[0][0] = 1 / (this.aspect * Math.tan(this.fov / 2));
    this.camera[1][1] = 1 / (Math.tan(this.fov / 2));
    this.camera[2][2] = ((-1 * this.nearZ) - this.farZ) / (this.nearZ - this.farZ);
    this.camera[2][3] = 1;
    this.camera[3][2] = (2 * this.farZ * this.nearZ) / (this.nearZ - this.farZ);

    // Clear canvas
    this.clear = function()
    {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Draw a point expressed in cartesian coordinates
    this.drawPointCartesian = function(color, x, y, z)
    {

        y *= -1;

        // ---------------------------------------------------------
        // Rotate Y Axis
        // ---------------------------------------------------------

        var vector = [[x, y, z]];
        r = this.multiplyMatrix(vector, this.rotateY);
        x = r[0][0];
        y = r[0][1];
        z = r[0][2];

        // ---------------------------------------------------------
        // Rotate X Axis
        // ---------------------------------------------------------

        var vector = [[x, y, z]];
        r = this.multiplyMatrix(vector, this.rotateX);
        x = r[0][0];
        y = r[0][1];
        z = r[0][2];

        // Solid Sphere
        if (z < 0) return;

        // ---------------------------------------------------------
        // Camera 
        // ---------------------------------------------------------

        var vectorW = [[x, y, z, 1]];
        r = this.multiplyMatrix(vectorW, this.camera);
        x = r[0][0];
        y = r[0][1];
        z = r[0][2];

        // ---------------------------------------------------------

        var originX = this.canvas.width / 2 + x;
        var originY = this.canvas.height / 2 + y;
       
        // Draw the pixel in the screen.
        // This method was much faster than the "putImageData" function
        // More info at: http://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
        this.context.fillStyle = "rgba("+color[0]+","+color[1]+","+color[2]+",255)";
        this.context.fillRect( parseInt(originX), parseInt(originY), 1, 1 );

    }

    // Draw a sphere in the center of the screen with the given radius and distance between points
    this.drawSphere = function(colorLatitude, colorLongitude, radius, distancePoints)
    {

        // Draw Latitude Lines
        for (var thita = 0; thita < Math.PI; thita += Math.PI / 18)
        {
            var x = radius * Math.sin(thita);
            var y = radius * Math.cos(thita);
            var z = radius * -1 * Math.sin(thita);
            for (var phi = 0; phi < 2 * Math.PI; phi += distancePoints)
            {
                this.drawPointCartesian(
                        colorLatitude,
                        x * Math.cos(phi),
                        y,
                        z * Math.sin(phi)
                    );
            }
        }

        // Draw Longitude Lines
        for (var phi = 0; phi < Math.PI - .1; phi += Math.PI / 25)
        {
            var x = radius * Math.cos(phi);
            var z = radius * -1 * Math.sin(phi);
            for (var thita = 0; thita < 2 * Math.PI; thita += distancePoints)
            {
                // Don't draw polar lines
                if (((thita > 0.174) && (thita < 2.967)) ||
                    ((thita > 3.316) && (thita < 6.108)))
                {
                    this.drawPointCartesian(
                            colorLongitude,
                            Math.sin(thita) * x,
                            radius * Math.cos(thita),
                            Math.sin(thita) * z
                        );
                }
            }
        }

    }
    
    // Matrix multiplication algorithm
    this.multiplyMatrix = function(a, b)
    {
        var colsA = typeof a[0].length != "undefined" ? a[0].length : 1;
        var rowsB = b.length;
        if (colsA != rowsB) return null;
        var rowsA = a.length;
        var colsB = typeof b[0].length != "undefined" ? b[0].length : 1;
        var temp = 0;
        var r = new Array(new Array());
        for (var i = 0; i < rowsA; i++)
        {
            for (var j = 0; j < colsB; j++)
            {
                temp = 0;
                for (var k = 0; k < colsA; k++)
                {
                    temp += a[i][k] * b[k][j];
                }
                r[i][j] = temp;
            }
        }
        return r;
    }

}