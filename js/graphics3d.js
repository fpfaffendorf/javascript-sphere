// --------------------------------------------------------------------------------------
// Graphics3d Class Definition
// --------------------------------------------------------------------------------------
var Graphics3d = function(canvasId, theta, phi, fov, solid)
{

    // Canvas
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");

    // Camera aspect
    this.theta = theta;
    this.phi = phi;
    this.aspect = 1;
    this.fov = fov;
    this.nearZ = 1;
    this.farZ = 100;
    this.solid = solid;

    // Y axis rotation matrix
    this.rotateY = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.rotateY[0][0] = Math.cos(this.phi);
    this.rotateY[0][2] = Math.sin(this.phi) * -1;
    this.rotateY[1][1] = 1;
    this.rotateY[2][0] = Math.sin(this.phi);
    this.rotateY[2][2] = Math.cos(this.phi);

    // X axis rotation matrix
    this.rotateX = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.rotateX[0][0] = 1;
    this.rotateX[1][1] = Math.cos(this.theta);
    this.rotateX[1][2] = Math.sin(this.theta);
    this.rotateX[2][1] = Math.sin(this.theta) * -1;
    this.rotateX[2][2] = Math.cos(this.theta);

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
        if ((this.solid) && (z < 0)) return;

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
        this.context.fillStyle = "rgb("+color[0]+","+color[1]+","+color[2]+")";
        this.context.fillRect(parseInt(originX), parseInt(originY), 1, 1);

    }

    // Draw a sphere in the center of the screen with the given radius and distance between points
    this.drawSphere = function(colorLatitude, colorLongitude, radius, distancePoints, latitudeSegments, longitudeSegments)
    {

        // This method might be improved by drawing both latitude and longitude lines at the same time
        // using only one for loop. Anyway I kept both so it's clearer to understand what has to be 
        // done to draw the sphere.
    
        // Draw Latitude Lines
        for (var theta = 0; theta < Math.PI; theta += Math.PI / latitudeSegments)
        {
            var x = radius * Math.sin(theta);
            var y = radius * Math.cos(theta);
            var z = radius * -1 * Math.sin(theta);
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
        for (var phi = 0; phi < Math.PI - .01; phi += Math.PI / longitudeSegments)
        {
            var x = radius * Math.cos(phi);
            var z = radius * -1 * Math.sin(phi);
            for (var theta = 0; theta < 2 * Math.PI; theta += distancePoints)
            {
              this.drawPointCartesian(
                      colorLongitude,
                      Math.sin(theta) * x,
                      radius * Math.cos(theta),
                      Math.sin(theta) * z
                  );
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