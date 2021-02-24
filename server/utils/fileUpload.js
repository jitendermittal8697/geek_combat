const fs = require('fs');
const { google } = require('googleapis');
const formidable = require('formidable');

let oAuth2Client;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const SCOPES = [process.env.G_DRIVE_SCOPE];
const TOKEN_PATH = __dirname + process.env.G_DRIVE_TOKEN_PATH;
const CREDENTIALS_PATH = __dirname + process.env.G_DRIVE_CREDENTIALS_PATH


let fileUpload = (req, res) => {

    const form = formidable({ multiples: true });

    form.parse(req, (err, fields, files) => {

        fs.readFile(CREDENTIALS_PATH, (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;
            oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) return console.log("ERROR Reading token.json");
                oAuth2Client.setCredentials(JSON.parse(token));
                const drive = google.drive({ version: 'v3', auth: oAuth2Client });

                let fileArray = Object.values(files);

                let count = 0;
                let result = [];
                var uploadToDrive = function (fileArray) {
                    console.log(count + 1)
                    if (!fileArray[count]) {
                        console.log('completed')
                        console.log(result);
                        res.status(200).send({
                            response: true,
                            data: result
                        })
                        return;
                    }
                    let fileMetadata = {
                        'name': fileArray[count]["name"],
                        parents: [process.env.GDRIVE_FOLDER_ID]
                    };
                    let media = {
                        mimeType: fileArray[count]["type"],
                        body: fs.createReadStream(fileArray[count]["path"])
                    };
                    drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: "id",
                    }, (err, file) => {
                        if (err) {
                            res.status(500).send({
                                response: false,
                                message: "Request unsuccessful !!" + err
                            })
                            // Handle error
                            console.error(err);
                        } else {
                            // console.log(file);
                            // console.log(file.data);
                            // drive.permissions.create({
                            //     resource: {
                            //         'type': 'domain',
                            //         'role': 'reader',
                            //         'domain': 'localhost:3000'
                            //     },
                            //     fileId: file.data.id,
                            //     fields: 'id',
                            //     // requestBody: {
                            //     //     role: 'reader',
                            //     //     type: 'anyone',
                            //     // }
                            // }, async (err, file) => {
                            //     if (err) {
                                    // res.status(500).send({
                                    //     response: false,
                                    //     message: "Request unsuccessful !!" + err
                                    // })
                                    // Handle error
                                //     console.error(err);
                                // } else {
                                    drive.files.get({
                                        fileId: file.data.id,
                                        fields: 'webViewLink'
                                    }).then(response => {

                                        result.push(response.data.webViewLink)
                                        uploadToDrive(fileArray)
                                    });
                            //     }
                            // });
                        }
                    });
                    count++;
                }
                uploadToDrive(fileArray)

            });
        });
    });

}

module.exports = {
    fileUpload,
}






