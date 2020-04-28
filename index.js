var request = require("request");
const commands = require("probot-commands");
module.exports = app => {
  app.log("Yay! The app was loaded!");
  app.on(["issue_comment.created", "issues.opened"], async context => {
    if (context.payload.comment.user.type === "Bot") {
      context.log("comment user type is bot, returning..");
      return;
    }
    var createform;
    if ((context.payload.issue.author_association === "OWNER") || (context.payload.issue.author_association === "COLLABORATOR"))
    {commands(app, "createform", (context, command) => {
      context.log("entered createform commands");
      createform = command.arguments.split(/[\s] */);
      var createformlength = createform.length;
      context.log(createform);
      
      // ----------------------------------
      
      // form code block
      {
        var options = {
          method: "POST",
          url: "https://api.typeform.com/forms",
          headers: {
            Accept: "application/json",
            "Content-Type": [
              "application/x-www-form-urlencoded",
              "application/json"
            ],
            Host: "api.typeform.com",
            Authorization: `${process.env.TYPEFORM_KEY}`,
            Cookie: "device_view=full"
          },
          body: JSON.stringify({
            title: createform[0],
            settings: {
              language: "en",
              is_public: true,
              progress_bar: "percentage",
              show_progress_bar: true
            },
            welcome_screens: [
              {
                ref: "nice-readable-welcome-ref",
                title: "Welcome",
                properties: {
                  description: 'description ' + context.payload.comment.url,
                  show_button: true,
                  button_text: "start"
                }
              }
            ],
            thankyou_screens: [
              {
                ref: "nice-readable-thank-you-ref",
                title: "Thank you",
                properties: {
                  show_button: true,
                  button_text: "start",
                  button_mode: "redirect",
                  redirect_url: "https://www.typeform.com",
                  share_icons: false
                }
              }
            ],
            fields: [
              {
                ref: "field1",
                title: createform[1],
                type: createform[2],
                properties: {
                  description: "field1 desc",
                  randomize: true,
                  allow_multiple_selection: true,
                  allow_other_choice: true,
                  vertical_alignment: false,
                  choices: [
                    { label: createform[3], ref: "field1_label1_ref" },
                    { label: createform[4], ref: "field1_label2_ref" }
                  ]
                }
              },
            ]
          })
        };
        request(options, function(error, response) {
          if (error) {
            const params1 = context.issue({body:'form not made. error processing command'})
            return context.github.issues.createComment(params1);
          };
          console.log(response.body);
          const params2 = context.issue({body:response.body._links.value});
          return context.github.issues.createComment(params2);
        });
       }

      // -----------------------------------
    });
    return;
    }
  });
};
